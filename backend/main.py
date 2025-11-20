from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabaseclient import supabase
import uuid
from datetime import datetime

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class UserSignup(BaseModel):
    email: str
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    registered_events: list

# Utility functions
def get_bu_email_id(email: str) -> str:
    """Convert email to bu.edu ID format (without @bu.edu)"""
    if email.endswith('@bu.edu'):
        return email.replace('@bu.edu', '')
    return email

def validate_bu_email(email: str) -> bool:
    """Validate that email is a BU email"""
    return email.endswith('@bu.edu')

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.post("/auth/signup")
async def signup(user_data: UserSignup):
    try:
        # Validate BU email
        if not validate_bu_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only BU email addresses (@bu.edu) are allowed"
            )

        # Check if user already exists
        user_id = get_bu_email_id(user_data.email)
        existing_user = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists with this email"
            )

        # Create user in Supabase
        user_data_dict = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": "student",  # Default role
            "registered_events": []  # Empty list for registered events
        }

        # In a real application, you would hash the password here
        # For now, we'll assume Supabase handles authentication separately
        # or you can implement password hashing with bcrypt
        
        response = supabase.table("users").insert(user_data_dict).execute()
        
        if response.data:
            return {
                "message": "User created successfully",
                "user": {
                    "id": user_data_dict["id"],
                    "email": user_data_dict["email"],
                    "full_name": user_data_dict["full_name"],
                    "role": user_data_dict["role"]
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during signup: {str(e)}"
        )

@app.post("/auth/login")
async def login(login_data: UserLogin):
    try:
        # Validate BU email
        if not validate_bu_email(login_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only BU email addresses (@bu.edu) are allowed"
            )

        # Get user by ID (email without @bu.edu)
        user_id = get_bu_email_id(login_data.email)
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        user = response.data[0]
        
        # In a real application, you would verify the password hash here
        # For demo purposes, we'll assume the password is correct
        # You should implement proper password verification with bcrypt
        
        # For now, we'll just return success if user exists
        # In production, you should implement proper password hashing and verification
        
        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "registered_events": user["registered_events"]
            }
        }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {str(e)}"
        )

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = response.data[0]
        return UserResponse(**user)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )

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

# Additional endpoint to register for events
@app.post("/users/{user_id}/events/{event_id}")
async def register_for_event(user_id: str, event_id: str):
    try:
        # Get current user
        user_response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_response.data[0]
        registered_events = user.get("registered_events", [])
        
        # Check if already registered
        if event_id in registered_events:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already registered for this event"
            )
        
        # Add event to registered events
        registered_events.append(event_id)
        
        # Update user
        update_response = supabase.table("users").update({
            "registered_events": registered_events
        }).eq("id", user_id).execute()
        
        if update_response.data:
            return {"message": "Successfully registered for event"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register for event"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering for event: {str(e)}"
        )