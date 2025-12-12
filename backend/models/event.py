from typing import Optional, List
from pydantic import BaseModel

class FoodItem(BaseModel):
    name: str
    allergy_info: Optional[str] = None
    is_kosher: Optional[bool] = None
    is_halal: Optional[bool] = None
    category: Optional[str] = None  # kept optional for forward compatibility

class EventCreate(BaseModel):
    name: str
    description: str
    location_name: str
    start_time: str
    end_time: str
    capacity: int
    creator_id: str
    creator_name: str
    food_items: Optional[List[FoodItem]] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    capacity: Optional[int] = None
    food_items: Optional[List[FoodItem]] = None

class EventResponse(BaseModel):
    id: str
    name: str
    description: str
    location_name: str
    start_time: str
    end_time: str
    capacity: int
    creator_name: str
