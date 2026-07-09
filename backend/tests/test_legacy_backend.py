"""LEGACY backend test suite — expanded for iteration 4 (Thrive tab + mass content bump)."""
import time
import uuid
import requests
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


# ---------- Mentors (17 now) ----------
class TestMentors:
    def test_list_mentors_has_17(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 17, f"expected 17 mentors, got {len(data)}"
        for m in data:
            assert "_id" not in m
            for f in ("mentor_id", "name", "categories", "price"):
                assert f in m

    @pytest.mark.parametrize("cat,expected_ids", [
        ("photography", {"mnt_zara", "mnt_neil"}),
        ("music", {"mnt_isha", "mnt_dev"}),
        ("sports", {"mnt_veer", "mnt_priya"}),
        ("languages", {"mnt_maria"}),
        ("ai", {"mnt_riya", "mnt_saanvi"}),
    ])
    def test_filter_by_category(self, api_client, base_url, cat, expected_ids):
        r = api_client.get(f"{base_url}/api/mentors", params={"category": cat})
        assert r.status_code == 200
        ids = {m["mentor_id"] for m in r.json()}
        assert expected_ids.issubset(ids), f"cat={cat} missing {expected_ids - ids}"

    def test_get_mentor_detail(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors/mnt_ananya")
        assert r.status_code == 200
        m = r.json()
        for f in ("bio", "subjects", "available_slots"):
            assert f in m

    def test_mentor_not_found(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/mentors/does_not_exist")
        assert r.status_code == 404


# ---------- Vault (16 items, each with content + pages) ----------
class TestVault:
    def test_vault_16(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vault")
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 16, f"expected 16 vault items, got {len(items)}"

    def test_vault_item_has_content_and_pages(self, api_client, base_url):
        listing = api_client.get(f"{base_url}/api/vault").json()
        assert listing, "vault empty"
        vid = listing[0]["vault_id"]
        r = api_client.get(f"{base_url}/api/vault/{vid}")
        assert r.status_code == 200
        d = r.json()
        assert "content" in d and isinstance(d["content"], str) and len(d["content"]) > 100, "content missing/short"
        assert "pages" in d and isinstance(d["pages"], int) and d["pages"] > 0

    def test_bookmark_toggle(self, api_client, base_url, guest_auth):
        listing = api_client.get(f"{base_url}/api/vault").json()
        vid = listing[0]["vault_id"]
        r1 = api_client.post(f"{base_url}/api/vault/{vid}/bookmark", headers=guest_auth["headers"])
        assert r1.status_code == 200
        s1 = r1.json()["bookmarked"]
        r2 = api_client.post(f"{base_url}/api/vault/{vid}/bookmark", headers=guest_auth["headers"])
        assert r2.status_code == 200
        assert r2.json()["bookmarked"] == (not s1)


# ---------- Careers (25 now) ----------
class TestCareers:
    def test_careers_25(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/careers")
        assert r.status_code == 200
        assert len(r.json()) == 25

    @pytest.mark.parametrize("cid", [
        "car_ai_research", "car_data_science", "car_ca", "car_journalism",
        "car_psychology", "car_architect", "car_content_creator", "car_civil_services",
        "car_scientist", "car_athlete", "car_musician", "car_teacher",
        "car_diplomat", "car_filmmaker", "car_astronaut", "car_chef", "car_medicine_research",
    ])
    def test_new_career_present(self, api_client, base_url, cid):
        r = api_client.get(f"{base_url}/api/careers/{cid}")
        assert r.status_code == 200, f"missing career {cid}"
        c = r.json()
        for f in ("roadmap", "skills"):
            assert f in c


# ---------- Community events (14 with detail) ----------
class TestCommunity:
    def test_events_14(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/community/events")
        assert r.status_code == 200
        assert len(r.json()) == 14

    def test_event_detail_has_fields(self, api_client, base_url):
        evs = api_client.get(f"{base_url}/api/community/events").json()
        eid = evs[0]["event_id"]
        r = api_client.get(f"{base_url}/api/community/events/{eid}")
        assert r.status_code == 200
        d = r.json()
        for f in ("long_description", "agenda", "location", "price"):
            assert f in d, f"event missing field {f}"
        assert isinstance(d["agenda"], list) and len(d["agenda"]) > 0

    def test_rsvp_toggle_and_counter(self, api_client, base_url, guest_auth):
        evs = api_client.get(f"{base_url}/api/community/events").json()
        eid = evs[0]["event_id"]
        before = api_client.get(f"{base_url}/api/community/events/{eid}").json().get("attendees", 0)
        r1 = api_client.post(f"{base_url}/api/community/events/{eid}/rsvp", headers=guest_auth["headers"])
        assert r1.status_code == 200
        s1 = r1.json()["registered"]
        mid = api_client.get(f"{base_url}/api/community/events/{eid}").json().get("attendees", 0)
        assert mid == (before + 1 if s1 else before - 1)
        # toggle back
        r2 = api_client.post(f"{base_url}/api/community/events/{eid}/rsvp", headers=guest_auth["headers"])
        assert r2.status_code == 200
        assert r2.json()["registered"] == (not s1)
        after = api_client.get(f"{base_url}/api/community/events/{eid}").json().get("attendees", 0)
        assert after == before

    def test_my_rsvps(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/community/my-rsvps", headers=guest_auth["headers"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Mentor applications ----------
class TestMentorApplications:
    def test_apply_and_fetch(self, api_client, base_url, guest_auth):
        payload = {
            "full_name": "TEST_Vidhi Jain",
            "grade": "Class 11",
            "school": "TEST_Delhi Public School",
            "subjects": ["Mathematics", "Physics"],
            "achievements": "TEST_Won a science quiz",
            "bio": "TEST_bio content",
            "hourly_rate": 299,
        }
        r = api_client.post(f"{base_url}/api/mentor-applications", json=payload, headers=guest_auth["headers"])
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "pending"
        assert d["full_name"] == "TEST_Vidhi Jain"
        assert "_id" not in d

        mine = api_client.get(f"{base_url}/api/mentor-applications/mine", headers=guest_auth["headers"])
        assert mine.status_code == 200
        m = mine.json()
        assert m is not None and m["full_name"] == "TEST_Vidhi Jain"


# ---------- Notifications ----------
class TestNotifications:
    def test_seed_and_list(self, api_client, base_url):
        # The demo guest user (vidhi.jain@legacy.demo) is upserted, so it may
        # already have notifs from other test flows. We verify the endpoint
        # returns >=1 notif and the seed path is exercised for a fresh
        # collection state (documented behavior: welcome seed only fires when
        # notifs collection is empty for that user).
        tok = api_client.post(f"{base_url}/api/auth/guest").json()["token"]
        h = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}
        r = api_client.get(f"{base_url}/api/notifications", headers=h)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        for n in arr:
            assert "message" in n and "_id" not in n

    def test_read_all(self, api_client, base_url, guest_auth):
        r = api_client.post(f"{base_url}/api/notifications/read-all", headers=guest_auth["headers"])
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- Thrive ----------
class TestThrive:
    def test_stories_4(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/thrive/stories")
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) == 4
        for s in arr:
            for f in ("title", "author", "badge", "body"):
                assert f in s

    def test_groups_6(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/thrive/groups")
        assert r.status_code == 200
        assert len(r.json()) == 6

    def test_challenges_5_with_done_flag(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/thrive/challenges", headers=guest_auth["headers"])
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) == 5
        for c in arr:
            assert "done" in c and isinstance(c["done"], bool)

    def test_challenge_complete_flips_done(self, api_client, base_url, guest_auth):
        r = api_client.post(f"{base_url}/api/thrive/challenges/complete",
                            json={"challenge_id": "water"}, headers=guest_auth["headers"])
        assert r.status_code == 200
        arr = api_client.get(f"{base_url}/api/thrive/challenges", headers=guest_auth["headers"]).json()
        w = next(c for c in arr if c["id"] == "water")
        assert w["done"] is True

    def test_mood_log_and_history(self, api_client, base_url, guest_auth):
        r = api_client.post(f"{base_url}/api/thrive/mood",
                            json={"mood": "stressed"}, headers=guest_auth["headers"])
        assert r.status_code == 200
        assert r.json()["mood"] == "stressed"
        h = api_client.get(f"{base_url}/api/thrive/mood/history", headers=guest_auth["headers"])
        assert h.status_code == 200
        arr = h.json()
        assert any(m["mood"] == "stressed" for m in arr)

    def test_journal_save_and_get(self, api_client, base_url, guest_auth):
        payload = {"went_well": "TEST_studied", "challenged": "TEST_math",
                   "grateful": "TEST_family", "tomorrow": "TEST_sleep early"}
        r = api_client.post(f"{base_url}/api/thrive/journal", json=payload, headers=guest_auth["headers"])
        assert r.status_code == 200
        assert r.json()["went_well"] == "TEST_studied"
        g = api_client.get(f"{base_url}/api/thrive/journal", headers=guest_auth["headers"])
        assert g.status_code == 200
        assert any(j.get("went_well") == "TEST_studied" for j in g.json())

    def test_wellness_summary(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/thrive/wellness-summary", headers=guest_auth["headers"])
        assert r.status_code == 200
        d = r.json()
        for f in ("total_moods", "top_mood", "journal_entries", "challenges_completed",
                  "focus_sessions", "study_hours"):
            assert f in d

    def test_encourage(self, api_client, base_url, guest_auth):
        r = api_client.post(f"{base_url}/api/thrive/encourage",
                            json={"message": "TEST_You got this!"}, headers=guest_auth["headers"])
        assert r.status_code == 200
        assert r.json().get("sent") is True


# ---------- Bookings (mock) ----------
class TestBookings:
    def test_create_booking(self, api_client, base_url, guest_auth):
        payload = {"mentor_id": "mnt_ananya", "date": "2026-02-14", "time": "10:00",
                   "session_type": "video", "notes": "TEST_notes"}
        r = api_client.post(f"{base_url}/api/bookings", json=payload, headers=guest_auth["headers"])
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["status"] == "confirmed" and b["mentor_id"] == "mnt_ananya"

    def test_bookings_list(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/bookings", headers=guest_auth["headers"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Career Chat (Haiku 4.5 speed check) ----------
class TestCareerChat:
    def test_nonstream_under_20s(self, api_client, base_url, guest_auth):
        sess = f"sess_{uuid.uuid4().hex[:10]}"
        payload = {"career_id": "car_marketing", "session_id": sess,
                   "message": "I love creativity. Should I choose marketing?"}
        t0 = time.time()
        r = api_client.post(f"{base_url}/api/career-chat", json=payload,
                            headers=guest_auth["headers"], timeout=60)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        d = r.json()
        assert "text" in d and len(d["text"]) > 20
        # SLA per review: < 20s
        assert elapsed < 20, f"AI response took {elapsed:.1f}s (>= 20s SLA)"

    def test_stream_sse(self, base_url, guest_auth):
        sess = f"sess_{uuid.uuid4().hex[:10]}"
        payload = {"career_id": "car_marketing", "session_id": sess,
                   "message": "What competitions should I do?"}
        with requests.post(f"{base_url}/api/career-chat/stream", json=payload,
                           headers={**guest_auth["headers"], "Accept": "text/event-stream"},
                           stream=True, timeout=120) as r:
            assert r.status_code == 200
            got_data = got_done = False
            for raw in r.iter_lines(decode_unicode=True):
                if raw and raw.startswith("data:"):
                    if raw.strip() == "data: [DONE]":
                        got_done = True
                        break
                    got_data = True
            assert got_data and got_done

    def test_history(self, api_client, base_url, guest_auth):
        sess = f"sess_{uuid.uuid4().hex[:10]}"
        api_client.post(f"{base_url}/api/career-chat",
                        json={"career_id": "car_marketing", "session_id": sess, "message": "hi"},
                        headers=guest_auth["headers"], timeout=60)
        r = api_client.get(f"{base_url}/api/career-chat/{sess}", headers=guest_auth["headers"])
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2


# ---------- Impact ----------
class TestImpact:
    def test_impact(self, api_client, base_url, guest_auth):
        r = api_client.get(f"{base_url}/api/impact", headers=guest_auth["headers"])
        assert r.status_code == 200
        for k in ("students_mentored", "resources_uploaded", "competitions_won", "lives_impacted"):
            assert k in r.json()


# ---------- Categories ----------
class TestCategories:
    def test_categories(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/categories")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 10


# ---------- Unauth ----------
class TestUnauthEndpoints:
    @pytest.mark.parametrize("method,path,body", [
        ("GET", "/api/auth/me", None),
        ("GET", "/api/bookings", None),
        ("POST", "/api/bookings", {"mentor_id": "mnt_ananya", "date": "2026-02-14", "time": "10:00"}),
        ("GET", "/api/impact", None),
        ("GET", "/api/notifications", None),
        ("POST", "/api/thrive/mood", {"mood": "okay"}),
        ("POST", "/api/mentor-applications", {"full_name": "x", "grade": "Class 11", "school": "s",
                                              "subjects": [], "achievements": "", "bio": "", "hourly_rate": 0}),
    ])
    def test_no_bearer_401(self, api_client, base_url, method, path, body):
        r = (api_client.get(f"{base_url}{path}") if method == "GET"
             else api_client.post(f"{base_url}{path}", json=body))
        assert r.status_code == 401, f"{method} {path} → {r.status_code}"
