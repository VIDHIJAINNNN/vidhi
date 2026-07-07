"""LEGACY backend test suite — covers all endpoints in the review request."""
import requests
import uuid
import pytest


# ---------- Health ----------
class TestHealth:
    def test_root(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        assert r.json() == {"app": "LEGACY", "status": "ok"}


# ---------- Auth ----------
class TestAuth:
    def test_guest_login_creates_session(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/auth/guest")
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and d["token"]
        assert d["user"]["name"] == "Vidhi Jain"
        assert d["user"]["email"] == "vidhi.jain@legacy.demo"
        assert "_id" not in d["user"]

    def test_me_with_bearer(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/auth/me", headers=guest_auth["headers"])
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == "vidhi.jain@legacy.demo"
        assert "_id" not in u

    def test_me_without_bearer_401(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_logout_and_then_me_401(self, api_client, base_url):
        # fresh session to avoid disturbing the shared guest_auth used elsewhere
        login = api_client.post(f"{base_url}/api/auth/guest").json()
        h = {"Authorization": f"Bearer {login['token']}"}
        r = api_client.post(f"{base_url}/api/auth/logout", headers=h)
        assert r.status_code == 200
        r2 = api_client.get(f"{base_url}/api/auth/me", headers=h)
        assert r2.status_code == 401


# ---------- Mentors ----------
class TestMentors:
    def test_list_mentors_has_6(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 6
        for m in data:
            for f in ("mentor_id", "name", "avatar", "verified", "rating", "sessions", "price", "achievements"):
                assert f in m, f"mentor missing {f}"
            assert "_id" not in m

    def test_filter_by_category_coding(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors", params={"category": "coding"})
        assert r.status_code == 200
        ids = [m["mentor_id"] for m in r.json()]
        assert "mnt_riya" in ids
        for m in r.json():
            assert "coding" in m["categories"]

    def test_search_ananya(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors", params={"q": "Ananya"})
        assert r.status_code == 200
        ids = [m["mentor_id"] for m in r.json()]
        assert "mnt_ananya" in ids

    def test_get_mentor_detail(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors/mnt_ananya")
        assert r.status_code == 200
        m = r.json()
        for f in ("bio", "subjects", "available_slots"):
            assert f in m
        assert "_id" not in m

    def test_reviews(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors/mnt_ananya/reviews")
        assert r.status_code == 200
        assert len(r.json()) >= 2
        for rv in r.json():
            assert "_id" not in rv

    def test_mentor_not_found(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors/does_not_exist")
        assert r.status_code == 404


# ---------- Categories ----------
class TestCategories:
    def test_categories_15(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/categories")
        assert r.status_code == 200
        assert len(r.json()) == 15


# ---------- Vault ----------
class TestVault:
    def test_vault_9(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vault")
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 9
        for it in items:
            assert "_id" not in it

    def test_vault_collections(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vault/collections")
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list) and len(rows) > 0
        for row in rows:
            assert "title" in row and "items" in row and isinstance(row["items"], list)


# ---------- Careers ----------
class TestCareers:
    def test_careers_8(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers")
        assert r.status_code == 200
        assert len(r.json()) == 8

    def test_career_marketing_detail(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers/car_marketing")
        assert r.status_code == 200
        c = r.json()
        for f in ("roadmap", "top_colleges", "skills", "salary_range", "day_in_life"):
            assert f in c


# ---------- Community ----------
class TestCommunity:
    def test_events_6(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/community/events")
        assert r.status_code == 200
        assert len(r.json()) == 6

    def test_workshops_filter(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/community/events", params={"kind": "workshops"})
        assert r.status_code == 200
        evs = r.json()
        assert len(evs) > 0
        for e in evs:
            assert e["kind"] == "workshops"


# ---------- Bookings (mock payment) ----------
class TestBookings:
    def test_create_booking_and_increment_sessions(self, api_client, base_url, guest_auth):
        # snapshot current mentor sessions
        before = api_client.get(f"{base_url}/api/mentors/mnt_ananya").json()["sessions"]

        payload = {"mentor_id": "mnt_ananya", "date": "2026-02-14", "time": "10:00", "session_type": "video", "notes": "TEST_notes"}
        r = api_client.post(f"{base_url}/api/bookings", json=payload, headers=guest_auth["headers"])
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["status"] == "confirmed"
        assert b["mentor_id"] == "mnt_ananya"
        assert "_id" not in b

        after = api_client.get(f"{base_url}/api/mentors/mnt_ananya").json()["sessions"]
        assert after == before + 1, f"sessions did not increment {before} -> {after}"

    def test_bookings_list(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/bookings", headers=guest_auth["headers"])
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        for b in arr:
            assert "_id" not in b

    def test_bookings_unauth_401(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/bookings")
        assert r.status_code == 401


# ---------- Impact ----------
class TestImpact:
    def test_impact(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/impact", headers=guest_auth["headers"])
        assert r.status_code == 200
        d = r.json()
        for k in ("students_mentored", "resources_uploaded", "competitions_won", "lives_impacted"):
            assert k in d


# ---------- Career Chat (Claude Sonnet 4.5 via Emergent LLM key) ----------
class TestCareerChat:
    @pytest.fixture(scope="class")
    def session_id(self):
        return f"sess_{uuid.uuid4().hex[:10]}"

    def test_career_chat_nonstream(self, api_client, base_url, guest_auth, session_id):
        payload = {"career_id": "car_marketing", "session_id": session_id, "message": "I love creativity. Should I choose marketing?"}
        r = api_client.post(f"{base_url}/api/career-chat", json=payload, headers=guest_auth["headers"], timeout=90)
        assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
        d = r.json()
        assert "text" in d and isinstance(d["text"], str) and len(d["text"]) > 20

    def test_career_chat_stream_sse(self, base_url, guest_auth, session_id):
        payload = {"career_id": "car_marketing", "session_id": session_id, "message": "What competitions should I do?"}
        with requests.post(
            f"{base_url}/api/career-chat/stream",
            json=payload,
            headers={**guest_auth["headers"], "Accept": "text/event-stream"},
            stream=True,
            timeout=120,
        ) as r:
            assert r.status_code == 200
            ct = r.headers.get("content-type", "")
            assert "text/event-stream" in ct, f"content-type={ct}"
            got_data = False
            got_done = False
            body_chunks = []
            for raw in r.iter_lines(decode_unicode=True):
                if raw is None:
                    continue
                if raw.startswith("data:"):
                    body_chunks.append(raw)
                    if raw.strip() == "data: [DONE]":
                        got_done = True
                        break
                    else:
                        got_data = True
            assert got_data, f"no data chunks; got={body_chunks[:5]}"
            assert got_done, "did not receive [DONE] terminator"

    def test_get_chat_history(self, api_client, base_url, guest_auth, session_id):
        r = api_client.get(f"{base_url}/api/career-chat/{session_id}", headers=guest_auth["headers"])
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2
        # must be sorted ascending by created_at (users and assistants interleaved)
        roles = [m["role"] for m in msgs]
        assert "user" in roles and "assistant" in roles
        for m in msgs:
            assert "_id" not in m


# ---------- Unauth Coverage ----------
class TestUnauthEndpoints:
    @pytest.mark.parametrize("method,path,body", [
        ("GET", "/api/auth/me", None),
        ("POST", "/api/auth/logout", None),
        ("GET", "/api/bookings", None),
        ("POST", "/api/bookings", {"mentor_id": "mnt_ananya", "date": "2026-02-14", "time": "10:00"}),
        ("GET", "/api/impact", None),
        ("GET", "/api/career-chat/xyz", None),
        ("POST", "/api/career-chat", {"career_id": "car_marketing", "session_id": "s", "message": "hi"}),
    ])
    def test_no_bearer_returns_401(self, api_client, base_url, method, path, body):
        if method == "GET":
            r = api_client.get(f"{base_url}{path}")
        else:
            r = api_client.post(f"{base_url}{path}", json=body)
        assert r.status_code == 401, f"{method} {path} expected 401 got {r.status_code}"
