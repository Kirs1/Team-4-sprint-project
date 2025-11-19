from fastapi import FastAPI
from supabaseclient import supabase


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/events")
def get_events():
    response = supabase.table("events").select("*").execute()

    events = response.data


    for e in events:
        e["start_time"] = str(e["start_time"])
        e["end_time"] = str(e["end_time"])
        e["location_name"] = str(e["location_name"])
        e["end_time"] = str(e["end_time"])
        e["created_at"] = str(e["created_at"])
        e["quantity_left"] = str(e["quantity_left"])
        e["description"] = str(e["description"])


    return events

# TODO : Implement proper event creation with validation
@app.post("/events/create")
async def create_event(event: dict, food: str = "default_food"):
    return {"status": "event created", "event": event}

# TODO : Implement proper user retrieval, expand as needed
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": "User" + str(user_id)}