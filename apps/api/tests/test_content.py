async def test_projects_lists_only_published(client, seeded):
    r = await client.get("/api/v1/projects")
    assert r.status_code == 200
    slugs = [p["slug"] for p in r.json()]
    assert "documind" in slugs and "tweetgenerator" in slugs
    for p in r.json():
        assert "body_mdx" not in p  # list items stay light


async def test_project_detail_shape(client, seeded):
    r = await client.get("/api/v1/projects/documind")
    assert r.status_code == 200
    body = r.json()
    assert body["title"] == "DocuMind"
    assert isinstance(body["tech_stack"], list)
    assert "case study in progress" in body["body_mdx"].lower()


async def test_missing_project_is_problem_json(client, seeded):
    r = await client.get("/api/v1/projects/nope")
    assert r.status_code == 404
    assert r.headers["content-type"].startswith("application/problem+json")
    body = r.json()
    assert body["title"] == "Project not found"
    assert body["request_id"]


async def test_skills_grouped_and_settings(client, seeded):
    skills = (await client.get("/api/v1/skills")).json()
    assert {"name": "FastAPI", "category": "frameworks"} in skills
    settings = (await client.get("/api/v1/settings")).json()["data"]
    assert settings["name"] == "Divyam Tyagi"
    assert "proficiency" not in str(skills)  # no skill bars, ever
