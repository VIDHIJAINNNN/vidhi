import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to grab public URL
load_dotenv(Path("/app/frontend/.env"))

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    raise RuntimeError("EXPO_PUBLIC_BACKEND_URL missing in /app/frontend/.env")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def guest_auth(api_client):
    r = api_client.post(f"{BASE_URL}/api/auth/guest")
    assert r.status_code == 200, f"guest login failed: {r.status_code} {r.text}"
    data = r.json()
    return {"token": data["token"], "user": data["user"], "headers": {"Authorization": f"Bearer {data['token']}", "Content-Type": "application/json"}}
