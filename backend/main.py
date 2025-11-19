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