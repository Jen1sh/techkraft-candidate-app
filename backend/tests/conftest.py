import os

import pytest
from fastapi.testclient import TestClient

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "techcraft.db")


@pytest.fixture(scope="session", autouse=True)
def _clean_db_session():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    yield
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


@pytest.fixture(scope="session")
def client(_clean_db_session):
    from app.main import app

    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_token(client):
    r = client.post(
        "/api/auth/login",
        json={"email": "admin@techcraft.com", "password": "password123"},
    )
    return r.json()["access_token"]


@pytest.fixture
def reviewer_token(client):
    r = client.post(
        "/api/auth/login",
        json={"email": "reviewer@techcraft.com", "password": "password123"},
    )
    return r.json()["access_token"]
