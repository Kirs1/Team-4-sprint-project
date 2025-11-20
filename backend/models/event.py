from typing import Optional
from pydantic import BaseModel

class EventCreate(BaseModel):
    name: str
    description: str
    location_name: str
    start_time: str
    end_time: str
    capacity: int

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    capacity: Optional[int] = None

class EventResponse(BaseModel):
    id: str
    name: str
    description: str
    location_name: str
    start_time: str
    end_time: str
    capacity: int
    creator: str