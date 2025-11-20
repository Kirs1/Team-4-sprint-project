from pydantic import BaseModel

class EventCreate(BaseModel):
    name: str
    description: str
    location_name: str
    start_time: str
    end_time: str
    capacity: int