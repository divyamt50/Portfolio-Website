async def test_healthz_is_dependency_free(client):
    r = await client.get("/healthz")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
    assert "x-request-id" in r.headers


async def test_readyz_round_trips_database(client, seeded):
    r = await client.get("/readyz")
    assert r.status_code == 200
    assert r.json()["database"] == "ok"
