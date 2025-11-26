from fastapi import FastAPI, HTTPException, status
from .db.supabaseclient import supabase
from datetime import datetime
from .models.user import User, UserResponse
from .models.event import EventCreate, EventUpdate

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def get_bu_email_id(email: str) -> str:
    """Convert email to bu.edu ID format (without @bu.edu)"""
    if email.endswith('@bu.edu'):
        return email.replace('@bu.edu', '')
    return email

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.post("/users")
async def signup(user_data: User):
    try:
        # Check if user already exists
        user_id = user_data.id
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
            "full_name": user_data.name,
            "role": "student",  # Default role
            "registered_events": []  # Empty list for registered events
        }
        
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

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    try:
        response = supabase.table("users").select(
            "email, full_name, role, registered_events, created_events"
        ).eq("id", user_id).execute()
        
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


# TODO: add exceptions for get events

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


@app.get("/events/{event_id}")
def get_event(event_id: str):
    response = supabase.table("events").select("*").eq("id", event_id).execute()

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
@app.post("/events/{event_id}/registrations/{user_id}")
async def register_for_event(event_id: str, user_id: str):
    try:
        # Get current user
        user_response = supabase.table("users").select("registered_events").eq("id", user_id).execute()
        
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
    
# TODO look over rest of file for auth integration
    
@app.post("/events")
async def create_event(event_data: EventCreate):
    try:
        # Verify the user exists
        user_response = supabase.table("users").select("*").eq("id", event_data.creator_id).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create the event with creator_name
        event_dict = {
            "name": event_data.name,
            "description": event_data.description,
            "location_name": event_data.location_name,
            "start_time": event_data.start_time,
            "end_time": event_data.end_time,
            "quantity_left": event_data.capacity,
            "creator_name": event_data.creator_name,
            "creator_id": event_data.creator_id,
            "created_at": datetime.now().isoformat()
        }

        # Insert the event
        response = supabase.table("events").insert(event_dict).execute()
        
        if response.data:
            # Update user's created_events count - handle None/undefined case safely
            user = user_response.data[0]
            current_created_events = user.get("created_events", 0)
            
            # Safely handle None, string, or any unexpected type
            try:
                if current_created_events is None:
                    current_created_events = 0
                else:
                    current_created_events = int(current_created_events)
            except (TypeError, ValueError):
                current_created_events = 0
            
            new_created_events = current_created_events + 1
            
            update_response = supabase.table("users").update({
                "created_events": new_created_events
            }).eq("id", event_data.creator_id).execute()
            
            if update_response.data:
                return {
                    "message": "Event created successfully",
                    "event": response.data[0]
                }
            else:
                # Rollback event creation if user update fails
                supabase.table("events").delete().eq("id", response.data[0]["id"]).execute()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update user stats"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create event"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating event: {str(e)}"
        )

@app.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventUpdate, user_id: str):
    """
    Edit an event.
    user_id: The currently logged-in user ID (passed first using the query param, then modified after receiving the auth parameter).
    """
    try:
        # 1. Check if the event exists
        event_response = supabase.table("events").select("*").eq("id", event_id).execute()
        if not event_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        event = event_response.data[0]

        # 2. Permission check: Only the creator can edit (you can comment this out if it's not needed for now).
        if event.get("creator_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event creator can edit this event"
            )

        # 3. Update only the fields passed in from the front end
        update_data = event_data.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided to update"
            )

        # 4. Call supabase to update
        response = supabase.table("events").update(update_data).eq("id", event_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update event"
            )

        updated_event = response.data[0]

        # 5. Maintain the same string processing as other interfaces.
        updated_event["start_time"] = str(updated_event["start_time"])
        updated_event["end_time"] = str(updated_event["end_time"])
        updated_event["location_name"] = str(updated_event["location_name"])
        updated_event["created_at"] = str(updated_event["created_at"])
        updated_event["quantity_left"] = str(updated_event["quantity_left"])
        updated_event["description"] = str(updated_event["description"])

        return {
            "message": "Event updated successfully",
            "event": updated_event
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating event: {str(e)}"
        )
    
# Update the get user created events endpoint
@app.get("/users/{user_id}/created-events")
async def get_user_created_events(user_id: str):
    try:
        # Get events created by this user using creator_id
        response = supabase.table("events").select("*").eq("creator_id", user_id).execute()
        
        events = response.data
        for e in events:
            e["start_time"] = str(e["start_time"])
            e["end_time"] = str(e["end_time"])
            e["location_name"] = str(e["location_name"])
            e["created_at"] = str(e["created_at"])
            e["quantity_left"] = str(e["quantity_left"])
            e["description"] = str(e["description"])

        return events
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user events: {str(e)}"
        )

@app.delete("/events/{event_id}")
async def delete_event(event_id: str, user_id: str):
    """
    Delete an event.
    Only the event creator or an admin can delete the event.
    """
    try:
        # 1. find the event
        event_response = supabase.table("events").select("*").eq("id", event_id).execute()
        if not event_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        event = event_response.data[0]

        # 2. find the user
        user_response = supabase.table("users").select("id, role").eq("id", user_id).execute()
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user = user_response.data[0]
        user_role = user.get("role")

        # 3. permission check
        is_creator = (event.get("creator_id") == user_id)
        is_admin = (user_role == "admin")

        if not (is_creator or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event creator or an admin can delete this event"
            )

        # 4. delete the event
        supabase.table("events").delete().eq("id", event_id).execute()

        return {"message": "Event deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting event: {str(e)}"
        )