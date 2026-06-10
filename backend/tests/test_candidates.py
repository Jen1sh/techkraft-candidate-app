import pytest


class TestCandidatesApi:
    """API endpoint tests."""

    def test_list_candidates(self, client, reviewer_token):
        resp = client.get(
            "/api/candidates",
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "meta" in data
        assert len(data["data"]) > 0
        assert data["meta"]["total"] > 0

    def test_get_candidate_detail(self, client, reviewer_token):
        resp = client.get(
            "/api/candidates/2",
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == 2
        assert data["name"] == "Bob Smith"
        assert "reviews" in data

    def test_add_and_get_my_scores(self, client, reviewer_token):
        add_resp = client.post(
            "/api/candidates/2/scores",
            json={
                "categories": [
                    {"category": "Technical Skills", "score": 4, "note": "Good"},
                ]
            },
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert add_resp.status_code == 201
        added = add_resp.json()
        assert added["candidate_id"] == 2
        assert len(added["categories"]) == 1

        get_resp = client.get(
            "/api/candidates/2/scores",
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert get_resp.status_code == 200
        assert get_resp.json()["candidate_id"] == 2

    def test_candidates_summary(self, client, reviewer_token):
        resp = client.get(
            "/api/candidates/summary",
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] > 0
        for key in ("new", "reviewed", "hired", "rejected"):
            assert key in data


class TestAuthEnforcement:
    """Auth enforcement tests."""

    def test_reviewer_cannot_patch_candidate(self, client, reviewer_token):
        resp = client.patch(
            "/api/candidates/1",
            json={"status": "reviewed"},
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert resp.status_code == 403
        assert "Admin access required" in resp.text

    def test_reviewer_cannot_see_other_reviewer_scores(self, client, reviewer_token):
        reviewer_1_token = reviewer_token

        client.post(
            "/api/candidates/2/scores",
            json={
                "categories": [
                    {"category": "Communication", "score": 3, "note": "Reviewer 1 note"},
                ]
            },
            headers={"Authorization": f"Bearer {reviewer_1_token}"},
        )

        reg_resp = client.post(
            "/api/auth/register",
            json={
                "name": "Reviewer Two",
                "email": "reviewer2@test.com",
                "password": "password123",
            },
        )
        assert reg_resp.status_code == 201

        login_resp = client.post(
            "/api/auth/login",
            json={"email": "reviewer2@test.com", "password": "password123"},
        )
        r2_token = login_resp.json()["access_token"]

        resp = client.get(
            "/api/candidates/2",
            headers={"Authorization": f"Bearer {r2_token}"},
        )
        assert resp.status_code == 200
        reviews = resp.json()["reviews"]
        if reviews:
            for review in reviews:
                assert review["reviewer"]["id"] != 1
                for cat in review["categories"]:
                    assert cat["note"] != "Reviewer 1 note"

    def test_reviewer_sees_own_scores_not_others(self, client, reviewer_token):
        reviewer_1_token = reviewer_token

        client.post(
            "/api/candidates/2/scores",
            json={
                "categories": [
                    {"category": "Problem Solving", "score": 5, "note": "Only reviewer 1"},
                ]
            },
            headers={"Authorization": f"Bearer {reviewer_1_token}"},
        )

        reg_resp = client.post(
            "/api/auth/register",
            json={
                "name": "Reviewer Three",
                "email": "reviewer3@test.com",
                "password": "password123",
            },
        )
        assert reg_resp.status_code == 201

        login_resp = client.post(
            "/api/auth/login",
            json={"email": "reviewer3@test.com", "password": "password123"},
        )
        r3_token = login_resp.json()["access_token"]

        r3_detail = client.get(
            "/api/candidates/2",
            headers={"Authorization": f"Bearer {r3_token}"},
        )
        assert r3_detail.status_code == 200
        assert r3_detail.json()["reviews"] == []

        r1_detail = client.get(
            "/api/candidates/2",
            headers={"Authorization": f"Bearer {reviewer_1_token}"},
        )
        assert r1_detail.status_code == 200
        assert len(r1_detail.json()["reviews"]) > 0

    def test_unauthorized_access(self, client):
        resp = client.get("/api/candidates")
        assert resp.status_code == 401
