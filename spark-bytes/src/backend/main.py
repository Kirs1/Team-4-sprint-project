from fastapi import fastapi 

app = fastapi.FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/events")
async def get_events():
    return {"events": []}

@app.post("/events/create")
async def create_event(event: dict, food: str = "default_food"):
    return {"status": "event created", "event": event}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": "User" + str(user_id)}



