import os
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from fastapi.security.utils import get_authorization_scheme_param
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "legacy_db")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="LEGACY API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("legacy")


# ---------- Models ----------
class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    grade: Optional[str] = None
    school: Optional[str] = None
    created_at: str


class SessionRequest(BaseModel):
    session_token: str


class BookingCreate(BaseModel):
    mentor_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    session_type: str = "video"
    notes: Optional[str] = ""


class ChatMessage(BaseModel):
    role: str
    text: str


class CareerChatRequest(BaseModel):
    career_id: str
    session_id: str
    message: str


# ---------- Helpers ----------
def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


async def get_current_user(request: Request) -> Dict[str, Any]:
    auth = request.headers.get("Authorization", "")
    scheme, token = get_authorization_scheme_param(auth)
    if not token or scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < _now():
            raise HTTPException(status_code=401, detail="Session expired")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Auth ----------
@api.post("/auth/session")
async def create_session(payload: SessionRequest):
    """Verify session_token with Emergent and create/refresh local session."""
    session_token = payload.session_token
    if not session_token:
        raise HTTPException(status_code=400, detail="session_token required")

    async with httpx.AsyncClient(timeout=15.0) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_token},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to verify session")
    data = r.json()

    email = data["email"]
    name = data.get("name", email.split("@")[0])
    picture = data.get("picture")

    # Upsert user (never dup by email)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": "student",
            "grade": None,
            "school": None,
            "created_at": _iso(_now()),
        }
        await db.users.insert_one(user.copy())
    else:
        if picture and user.get("picture") != picture:
            await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": picture}})
            user["picture"] = picture

    # Store session
    expires_at = _now() + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "session_token": session_token,
            "user_id": user["user_id"],
            "expires_at": expires_at,
            "created_at": _now(),
        }},
        upsert=True,
    )

    return {"token": session_token, "user": user}


@api.get("/auth/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout(request: Request, user: Dict[str, Any] = Depends(get_current_user)):
    auth = request.headers.get("Authorization", "")
    _, token = get_authorization_scheme_param(auth)
    await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


# ---------- Guest / Demo login for reviewers (mock, no Google) ----------
@api.post("/auth/guest")
async def guest_login():
    """Create/reuse a demo account for reviewers who cannot complete Google OAuth."""
    email = "vidhi.sharma@legacy.demo"
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": "Vidhi Sharma",
            "picture": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
            "role": "student",
            "grade": "Class 11",
            "school": "Delhi Public School",
            "created_at": _iso(_now()),
        }
        await db.users.insert_one(user.copy())

    token = f"guest_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "session_token": token,
        "user_id": user["user_id"],
        "expires_at": _now() + timedelta(days=7),
        "created_at": _now(),
    })
    return {"token": token, "user": user}


# ---------- Mentors ----------
@api.get("/mentors")
async def list_mentors(category: Optional[str] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category and category.lower() != "all":
        query["categories"] = {"$in": [category]}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"headline": {"$regex": q, "$options": "i"}},
            {"subjects": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.mentors.find(query, {"_id": 0}).to_list(200)
    return docs


@api.get("/mentors/{mentor_id}")
async def get_mentor(mentor_id: str):
    m = await db.mentors.find_one({"mentor_id": mentor_id}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Mentor not found")
    return m


@api.get("/mentors/{mentor_id}/reviews")
async def mentor_reviews(mentor_id: str):
    docs = await db.reviews.find({"mentor_id": mentor_id}, {"_id": 0}).to_list(50)
    return docs


# ---------- Categories ----------
@api.get("/categories")
async def categories():
    return [
        {"id": "academics", "name": "Academics", "icon": "book"},
        {"id": "business", "name": "Business", "icon": "briefcase"},
        {"id": "mun", "name": "MUN", "icon": "globe"},
        {"id": "debate", "name": "Debate", "icon": "chatbubbles"},
        {"id": "public_speaking", "name": "Public Speaking", "icon": "mic"},
        {"id": "coding", "name": "Coding", "icon": "code-slash"},
        {"id": "design", "name": "Design", "icon": "color-palette"},
        {"id": "music", "name": "Music", "icon": "musical-notes"},
        {"id": "sports", "name": "Sports", "icon": "basketball"},
        {"id": "photography", "name": "Photography", "icon": "camera"},
        {"id": "ai", "name": "AI", "icon": "sparkles"},
        {"id": "entrepreneurship", "name": "Entrepreneurship", "icon": "rocket"},
        {"id": "olympiads", "name": "Olympiads", "icon": "trophy"},
        {"id": "languages", "name": "Languages", "icon": "language"},
        {"id": "content", "name": "Content Creation", "icon": "videocam"},
    ]


# ---------- Legacy Vault ----------
@api.get("/vault")
async def list_vault(category: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    docs = await db.vault.find(query, {"_id": 0}).to_list(200)
    return docs


@api.get("/vault/collections")
async def vault_collections():
    """Return vault items grouped by collection for Netflix-style rows."""
    all_items = await db.vault.find({}, {"_id": 0}).to_list(500)
    groups: Dict[str, List[Dict[str, Any]]] = {}
    for item in all_items:
        groups.setdefault(item["collection"], []).append(item)
    order = ["Winning Presentations", "Debate Speeches", "MUN Position Papers",
             "Pitch Decks", "Scholarship Essays", "Notes & Study Guides"]
    result = []
    for name in order:
        if name in groups:
            result.append({"title": name, "items": groups[name]})
    return result


@api.post("/vault/{vault_id}/bookmark")
async def bookmark_vault(vault_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    exists = await db.bookmarks.find_one({"user_id": user["user_id"], "vault_id": vault_id})
    if exists:
        await db.bookmarks.delete_one({"user_id": user["user_id"], "vault_id": vault_id})
        return {"bookmarked": False}
    await db.bookmarks.insert_one({
        "user_id": user["user_id"],
        "vault_id": vault_id,
        "created_at": _now(),
    })
    return {"bookmarked": True}


# ---------- Careers ----------
@api.get("/careers")
async def list_careers():
    docs = await db.careers.find({}, {"_id": 0}).to_list(100)
    return docs


@api.get("/careers/{career_id}")
async def get_career(career_id: str):
    c = await db.careers.find_one({"career_id": career_id}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Career not found")
    return c


# ---------- Community ----------
@api.get("/community/events")
async def community_events(kind: Optional[str] = None):
    query: Dict[str, Any] = {}
    if kind and kind != "all":
        query["kind"] = kind
    docs = await db.events.find(query, {"_id": 0}).to_list(100)
    return docs


# ---------- Bookings (mock payment) ----------
@api.post("/bookings")
async def create_booking(payload: BookingCreate, user: Dict[str, Any] = Depends(get_current_user)):
    mentor = await db.mentors.find_one({"mentor_id": payload.mentor_id}, {"_id": 0})
    if not mentor:
        raise HTTPException(404, "Mentor not found")

    booking_id = f"bk_{uuid.uuid4().hex[:10]}"
    booking = {
        "booking_id": booking_id,
        "user_id": user["user_id"],
        "mentor_id": payload.mentor_id,
        "mentor_name": mentor["name"],
        "mentor_avatar": mentor["avatar"],
        "date": payload.date,
        "time": payload.time,
        "session_type": payload.session_type,
        "notes": payload.notes,
        "amount": mentor["price"],
        "currency": "INR",
        "status": "confirmed",  # mock payment success
        "created_at": _iso(_now()),
    }
    await db.bookings.insert_one(booking.copy())
    # increment mentor session count
    await db.mentors.update_one({"mentor_id": mentor["mentor_id"]}, {"$inc": {"sessions": 1}})
    return booking


@api.get("/bookings")
async def my_bookings(user: Dict[str, Any] = Depends(get_current_user)):
    docs = await db.bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


# ---------- Impact Stats ----------
@api.get("/impact")
async def impact(user: Dict[str, Any] = Depends(get_current_user)):
    # Personalized stats — use mock aggregation for demo. Real impl would count reality.
    bookings = await db.bookings.count_documents({"user_id": user["user_id"]})
    bookmarks = await db.bookmarks.count_documents({"user_id": user["user_id"]})
    return {
        "students_mentored": max(bookings * 3, 47),
        "resources_uploaded": max(bookmarks + 5, 23),
        "competitions_won": 5,
        "lives_impacted": 120,
    }


# ---------- AI Career Compass Chat (Claude Sonnet 4.5, streaming) ----------
@api.post("/career-chat/stream")
async def career_chat_stream(payload: CareerChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    career = await db.careers.find_one({"career_id": payload.career_id}, {"_id": 0})
    career_name = career["name"] if career else "career planning"

    # Persist user message
    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "user_id": user["user_id"],
        "career_id": payload.career_id,
        "role": "user",
        "text": payload.message,
        "created_at": _now(),
    })

    # Rebuild history from db to keep context (send as one prompt via multi-turn)
    history = await db.chat_messages.find(
        {"session_id": payload.session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    system = (
        f"You are Career Compass, a warm, wise senior-student mentor inside LEGACY app. "
        f"You give practical, honest, motivating career advice about {career_name} to Indian "
        f"school students (grades 6-12). Be concise (3-5 short paragraphs max). Use bullet "
        f"points when listing steps. Suggest colleges, skills, competitions, and next actions. "
        f"Never invent statistics. End with one thoughtful follow-up question."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=payload.session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Replay prior turns except the last user message we just added
    prior = history[:-1]
    for m in prior:
        if m["role"] == "user":
            try:
                async for _ev in chat.stream_message(UserMessage(text=m["text"])):
                    if isinstance(_ev, StreamDone):
                        break
            except Exception as e:
                logger.warning(f"replay error: {e}")
                break

    async def generator():
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=payload.message)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {ev.content}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.error(f"LLM stream error: {e}")
            yield f"data: [error: {str(e)}]\n\n"
        finally:
            if full:
                await db.chat_messages.insert_one({
                    "session_id": payload.session_id,
                    "user_id": user["user_id"],
                    "career_id": payload.career_id,
                    "role": "assistant",
                    "text": full,
                    "created_at": _now(),
                })
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@api.post("/career-chat")
async def career_chat_nonstream(payload: CareerChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Non-streaming fallback — returns the full text in one JSON response."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    career = await db.careers.find_one({"career_id": payload.career_id}, {"_id": 0})
    career_name = career["name"] if career else "career planning"

    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "user_id": user["user_id"],
        "career_id": payload.career_id,
        "role": "user",
        "text": payload.message,
        "created_at": _now(),
    })

    history = await db.chat_messages.find(
        {"session_id": payload.session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    system = (
        f"You are Career Compass, a warm, wise senior-student mentor inside LEGACY app. "
        f"You give practical, honest, motivating career advice about {career_name} to Indian "
        f"school students (grades 6-12). Be concise (3-5 short paragraphs max). Use bullet "
        f"points when listing steps. End with one thoughtful follow-up question."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=payload.session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    prior = history[:-1]
    for m in prior:
        if m["role"] == "user":
            try:
                await chat.send_message(UserMessage(text=m["text"]))
            except Exception as e:
                logger.warning(f"replay error: {e}")
                break

    try:
        text = await chat.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(status_code=502, detail=f"AI error: {e}")

    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "user_id": user["user_id"],
        "career_id": payload.career_id,
        "role": "assistant",
        "text": text,
        "created_at": _now(),
    })

    return {"text": text}


@api.get("/career-chat/{session_id}")
async def get_chat(session_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    docs = await db.chat_messages.find(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    for d in docs:
        if isinstance(d.get("created_at"), datetime):
            d["created_at"] = _iso(d["created_at"])
    return docs


# ---------- Health ----------
@api.get("/")
async def root():
    return {"app": "LEGACY", "status": "ok"}


# ---------- Startup: seed & indexes ----------
@app.on_event("startup")
async def on_start():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.mentors.create_index("mentor_id", unique=True)
    await db.vault.create_index("vault_id", unique=True)
    await db.careers.create_index("career_id", unique=True)
    await db.events.create_index("event_id", unique=True)
    await seed_data()


async def seed_data():
    from seed_data import SEED_MENTORS, SEED_VAULT, SEED_CAREERS, SEED_EVENTS, SEED_REVIEWS

    if await db.mentors.count_documents({}) == 0:
        await db.mentors.insert_many([m.copy() for m in SEED_MENTORS])
        logger.info(f"Seeded {len(SEED_MENTORS)} mentors")
    if await db.vault.count_documents({}) == 0:
        await db.vault.insert_many([v.copy() for v in SEED_VAULT])
        logger.info(f"Seeded {len(SEED_VAULT)} vault items")
    if await db.careers.count_documents({}) == 0:
        await db.careers.insert_many([c.copy() for c in SEED_CAREERS])
        logger.info(f"Seeded {len(SEED_CAREERS)} careers")
    if await db.events.count_documents({}) == 0:
        await db.events.insert_many([e.copy() for e in SEED_EVENTS])
        logger.info(f"Seeded {len(SEED_EVENTS)} events")
    if await db.reviews.count_documents({}) == 0:
        await db.reviews.insert_many([r.copy() for r in SEED_REVIEWS])
        logger.info(f"Seeded {len(SEED_REVIEWS)} reviews")


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db():
    client.close()
