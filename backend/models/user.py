from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    name: str
    email: EmailStr
    image: Optional[str] = None
    id: str

class UserResponse(BaseModel):
    email: str
    name: str
    role: str
    registered_events: list
    created_events: int