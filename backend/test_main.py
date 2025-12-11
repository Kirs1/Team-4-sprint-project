import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from main import app, get_bu_email_id
from models.user import User
from models.event import EventCreate, EventUpdate

client = TestClient(app)

# ===== Utility Function Tests =====

class TestUtilityFunctions:
    def test_get_bu_email_id_with_bu_edu_suffix(self):
        """Test converting email with @bu.edu suffix"""
        result = get_bu_email_id("student@bu.edu")
        assert result == "student"

    def test_get_bu_email_id_without_bu_edu_suffix(self):
        """Test email without @bu.edu suffix returns as-is"""
        result = get_bu_email_id("student")
        assert result == "student"


# ===== Root Endpoint Tests =====

class TestRootEndpoint:
    def test_root_endpoint(self):
        """Test that root endpoint returns expected message"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "FastAPI is running!"}


# ===== User Signup Tests =====

class TestUserSignup:
    @patch('main.supabase')
    def test_signup_new_user_success(self, mock_supabase):
        """Test successful user signup"""
        # Mock the select response
        mock_select = MagicMock()
        mock_select.execute.return_value.data = []
        
        mock_insert = MagicMock()
        mock_insert.execute.return_value.data = [{
            "id": "user123",
            "email": "test@bu.edu",
            "full_name": "Test User",
            "role": "student",
            "registered_events": []
        }]
        
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_select)
                        ))
                    )),
                    insert=MagicMock(return_value=MagicMock(
                        execute=MagicMock(return_value=mock_insert)
                    ))
                )
            return MagicMock()
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.post("/users", json={
            "id": "user123",
            "name": "Test User",
            "email": "test@bu.edu"
        })
        assert response.status_code == 200
        assert response.json()["message"] == "User created successfully"
        assert response.json()["user"]["email"] == "test@bu.edu"

    @patch('main.supabase')
    def test_signup_existing_user_fails(self, mock_supabase):
        """Test that signup fails for existing user"""
        # Mock the select response to return existing user
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "user123",
            "email": "existing@bu.edu"
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.post("/users", json={
            "id": "user123",
            "name": "Existing User",
            "email": "existing@bu.edu"
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    @patch('main.supabase')
    def test_signup_server_error(self, mock_supabase):
        """Test signup with server error"""
        mock_select = MagicMock()
        mock_select.execute.return_value.data = []
        
        mock_insert = MagicMock()
        mock_insert.execute.return_value.data = None
        
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_select)
                        ))
                    )),
                    insert=MagicMock(return_value=MagicMock(
                        execute=MagicMock(return_value=mock_insert)
                    ))
                )
            return MagicMock()
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.post("/users", json={
            "id": "user123",
            "name": "Test User",
            "email": "test@bu.edu"
        })
        assert response.status_code == 500


# ===== Get User Tests =====

class TestGetUser:
    @patch('main.supabase')
    def test_get_user_success(self, mock_supabase):
        """Test getting user details successfully"""
        mock_response = MagicMock()
        mock_response.data = [{
            "email": "test@bu.edu",
            "full_name": "Test User",
            "role": "student",
            "registered_events": ["event1", "event2"],
            "created_events": 3,
            "id": "user123"
        }]
        
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_response)
                        ))
                    ))
                )
            return MagicMock()
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.get("/users/user123")
        assert response.status_code == 200
        assert response.json()["email"] == "test@bu.edu"
        assert response.json()["role"] == "student"

    @patch('main.supabase')
    def test_get_user_not_found(self, mock_supabase):
        """Test getting non-existent user"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/users/nonexistent")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# ===== Get Events Tests =====

class TestGetEvents:
    @patch('main.supabase')
    def test_get_events_success(self, mock_supabase):
        """Test getting all events"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": 1,
            "name": "Event 1",
            "description": "Description 1",
            "location_name": "Boston",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "created_at": "2025-01-01 00:00:00",
            "quantity_left": 10
        }]
        
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        response = client.get("/events")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["name"] == "Event 1"

    @patch('main.supabase')
    def test_get_events_empty(self, mock_supabase):
        """Test getting events when none exist"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response
        
        response = client.get("/events")
        assert response.status_code == 200
        assert response.json() == []


# ===== Get Single Event Tests =====

class TestGetSingleEvent:
    @patch('main.supabase')
    def test_get_event_success(self, mock_supabase):
        """Test getting a single event"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": 1,
            "name": "Event 1",
            "description": "Description 1",
            "location_name": "Boston",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "created_at": "2025-01-01 00:00:00",
            "quantity_left": 10
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/events/1")
        assert response.status_code == 200
        assert response.json()[0]["name"] == "Event 1"

    @patch('main.supabase')
    def test_get_event_not_found(self, mock_supabase):
        """Test getting non-existent event"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/events/999")
        assert response.status_code == 200
        assert response.json() == []


# ===== Create Event Tests =====

class TestCreateEvent:
    @patch('main.supabase')
    def test_create_event_success(self, mock_supabase):
        """Test successful event creation"""
        # Mock user exists
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "created_events": 0
        }]
        
        # Mock event insert
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": 1,
            "name": "New Event",
            "description": "Event Description",
            "location_name": "Boston",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "creator_id": "user123",
            "creator_name": "Test User",
            "quantity_left": 50
        }]
        
        # Mock user update
        mock_update_response = MagicMock()
        mock_update_response.data = [{"created_events": 1}]
        
        # Setup mock to handle different table calls
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_user_response)
                        ))
                    )),
                    update=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_update_response)
                        ))
                    ))
                )
            else:  # events
                return MagicMock(
                    insert=MagicMock(return_value=MagicMock(
                        execute=MagicMock(return_value=mock_event_response)
                    ))
                )
        
        mock_supabase.table.side_effect = table_side_effect
        
        event_data = EventCreate(
            name="New Event",
            description="Event Description",
            location_name="Boston",
            start_time="2025-01-01 10:00:00",
            end_time="2025-01-01 12:00:00",
            capacity=50,
            creator_id="user123",
            creator_name="Test User"
        )
        
        response = client.post("/events", json=event_data.dict())
        assert response.status_code == 200
        assert response.json()["message"] == "Event created successfully"

    @patch('main.supabase')
    def test_create_event_user_not_found(self, mock_supabase):
        """Test event creation fails if user doesn't exist"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        event_data = EventCreate(
            name="New Event",
            description="Event Description",
            location_name="Boston",
            start_time="2025-01-01 10:00:00",
            end_time="2025-01-01 12:00:00",
            capacity=50,
            creator_id="nonexistent",
            creator_name="Test User"
        )
        
        response = client.post("/events", json=event_data.dict())
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# ===== Register for Event Tests =====

class TestRegisterForEvent:
    @patch('main.supabase')
    def test_register_for_event_success(self, mock_supabase):
        """Test successful event registration"""
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "registered_events": []
        }]
        
        # Mock user update
        mock_update_response = MagicMock()
        mock_update_response.data = [{"registered_events": ["event1"]}]
        
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "name": "Event 1",
            "quantity_left": 10
        }]
        
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_user_response)
                        ))
                    )),
                    update=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_update_response)
                        ))
                    ))
                )
            else:
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_event_response)
                        ))
                    ))
                )
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.post("/events/event1/registrations/user123")
        assert response.status_code == 200
        assert "Successfully registered" in response.json()["message"]

    @patch('main.supabase')
    def test_register_for_event_user_not_found(self, mock_supabase):
        """Test registration fails when user doesn't exist"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.post("/events/event1/registrations/nonexistent")
        assert response.status_code == 404

    @patch('main.supabase')
    def test_register_for_event_already_registered(self, mock_supabase):
        """Test registration fails if user is already registered"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "user123",
            "registered_events": ["event1"]
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.post("/events/event1/registrations/user123")
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()


# ===== Update Event Tests =====

class TestUpdateEvent:
    @patch('main.supabase')
    def test_update_event_success(self, mock_supabase):
        """Test successful event update"""
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "name": "Old Name",
            "description": "Old Description",
            "location_name": "Boston",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "creator_id": "user123",
            "created_at": "2025-01-01 00:00:00",
            "quantity_left": "10"
        }]
        
        # Mock event update
        mock_update_response = MagicMock()
        mock_update_response.data = [{
            "id": "event1",
            "name": "New Name",
            "description": "Old Description",
            "location_name": "Boston",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "creator_id": "user123",
            "created_at": "2025-01-01 00:00:00",
            "quantity_left": "10"
        }]
        
        def table_side_effect(table_name):
            if table_name == "events":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_event_response)
                        ))
                    )),
                    update=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_update_response)
                        ))
                    ))
                )
            return MagicMock()
        
        mock_supabase.table.side_effect = table_side_effect
        
        event_update = EventUpdate(name="New Name")
        response = client.put("/events/event1?user_id=user123", json=event_update.dict())
        
        assert response.status_code == 200
        assert "updated successfully" in response.json()["message"].lower()

    @patch('main.supabase')
    def test_update_event_not_found(self, mock_supabase):
        """Test update fails when event doesn't exist"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        event_update = EventUpdate(name="New Name")
        response = client.put("/events/nonexistent?user_id=user123", json=event_update.dict())
        
        assert response.status_code == 404

    @patch('main.supabase')
    def test_update_event_permission_denied(self, mock_supabase):
        """Test update fails if user is not the creator"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "event1",
            "creator_id": "user456"
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        event_update = EventUpdate(name="New Name")
        response = client.put("/events/event1?user_id=user123", json=event_update.dict())
        
        assert response.status_code == 403
        assert "creator" in response.json()["detail"].lower()


# ===== Get User Created Events Tests =====

class TestGetUserCreatedEvents:
    @patch('main.supabase')
    def test_get_user_created_events_success(self, mock_supabase):
        """Test getting events created by a user"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": 1,
            "name": "My Event",
            "creator_id": "user123",
            "start_time": "2025-01-01 10:00:00",
            "end_time": "2025-01-01 12:00:00",
            "location_name": "Boston",
            "created_at": "2025-01-01 00:00:00",
            "quantity_left": 10,
            "description": "Event Description"
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/users/user123/created-events")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["creator_id"] == "user123"

    @patch('main.supabase')
    def test_get_user_created_events_empty(self, mock_supabase):
        """Test getting created events when user has none"""
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/users/user123/created-events")
        assert response.status_code == 200
        assert response.json() == []


# ===== Register Event Tests =====

class TestRegisterEvent:
    @patch('main.supabase')
    def test_register_event_success(self, mock_supabase):
        """Test successful event registration via new endpoint"""
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "quantity_left": 5
        }]
        
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "registered_events": []
        }]
        
        # Mock updates
        mock_user_update = MagicMock()
        mock_user_update.execute.return_value.data = [{"registered_events": ["event1"]}]
        
        mock_event_update = MagicMock()
        mock_event_update.execute.return_value.data = [{"quantity_left": 4}]
        
        def table_side_effect(table_name):
            if table_name == "events":
                mock_events = MagicMock()
                mock_events.select.return_value.eq.return_value.execute.return_value = mock_event_response
                mock_events.update.return_value.eq.return_value.execute.return_value = mock_event_update
                return mock_events
            else:  # users
                mock_users = MagicMock()
                mock_users.select.return_value.eq.return_value.execute.return_value = mock_user_response
                mock_users.update.return_value.eq.return_value.execute.return_value = mock_user_update
                return mock_users
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.post("/events/event1/register", json={"user_id": "user123"})
        assert response.status_code == 200
        assert "Successfully" in response.json()["message"]

    @patch('main.supabase')
    def test_register_event_no_spots(self, mock_supabase):
        """Test registration fails when event is full"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "event1",
            "quantity_left": 0
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.post("/events/event1/register", json={"user_id": "user123"})
        assert response.status_code == 400
        assert "No spots" in response.json()["detail"]


# ===== Get User Interested Events Tests =====

class TestGetUserInterestedEvents:
    @patch('main.supabase')
    def test_get_interested_events_success(self, mock_supabase):
        """Test getting events user is interested in"""
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "registered_events": ["event1", "event2"]
        }]
        
        # Mock events fetch
        mock_events_response = MagicMock()
        mock_events_response.data = [
            {
                "id": "event1",
                "name": "Event 1",
                "start_time": "2025-01-01 10:00:00",
                "end_time": "2025-01-01 12:00:00",
                "location_name": "Boston",
                "created_at": "2025-01-01 00:00:00",
                "quantity_left": 10,
                "description": "Event 1 Description"
            },
            {
                "id": "event2",
                "name": "Event 2",
                "start_time": "2025-01-02 10:00:00",
                "end_time": "2025-01-02 12:00:00",
                "location_name": "Cambridge",
                "created_at": "2025-01-02 00:00:00",
                "quantity_left": 5,
                "description": "Event 2 Description"
            }
        ]
        
        def table_side_effect(table_name):
            if table_name == "users":
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        eq=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_user_response)
                        ))
                    ))
                )
            else:  # events
                return MagicMock(
                    select=MagicMock(return_value=MagicMock(
                        in_=MagicMock(return_value=MagicMock(
                            execute=MagicMock(return_value=mock_events_response)
                        ))
                    ))
                )
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.get("/users/user123/interested-events")
        assert response.status_code == 200
        assert len(response.json()) == 2

    @patch('main.supabase')
    def test_get_interested_events_none(self, mock_supabase):
        """Test getting interested events when user has none"""
        mock_response = MagicMock()
        mock_response.data = [{
            "registered_events": []
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.get("/users/user123/interested-events")
        assert response.status_code == 200
        assert response.json() == []


# ===== Unregister Event Tests =====

class TestUnregisterEvent:
    @patch('main.supabase')
    def test_unregister_event_success(self, mock_supabase):
        """Test successful event unregistration"""
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "registered_events": ["event1", "event2"]
        }]
        
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "quantity_left": 5
        }]
        
        # Mock updates
        mock_user_update = MagicMock()
        mock_user_update.execute.return_value.data = [{"registered_events": ["event2"]}]
        
        mock_event_update = MagicMock()
        mock_event_update.execute.return_value.data = [{"quantity_left": 6}]
        
        def table_side_effect(table_name):
            if table_name == "events":
                mock_events = MagicMock()
                mock_events.select.return_value.eq.return_value.execute.return_value = mock_event_response
                mock_events.update.return_value.eq.return_value.execute.return_value = mock_event_update
                return mock_events
            else:  # users
                mock_users = MagicMock()
                mock_users.select.return_value.eq.return_value.execute.return_value = mock_user_response
                mock_users.update.return_value.eq.return_value.execute.return_value = mock_user_update
                return mock_users
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.post("/events/event1/unregister", json={"user_id": "user123"})
        assert response.status_code == 200
        assert "Successfully unregistered" in response.json()["message"]

    @patch('main.supabase')
    def test_unregister_event_not_registered(self, mock_supabase):
        """Test unregister fails if user not registered"""
        mock_response = MagicMock()
        mock_response.data = [{
            "id": "user123",
            "registered_events": []
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        response = client.post("/events/event1/unregister", json={"user_id": "user123"})
        assert response.status_code == 400
        assert "not registered" in response.json()["detail"].lower()


# ===== Delete Event Tests =====

class TestDeleteEvent:
    @patch('main.supabase')
    def test_delete_event_success_by_creator(self, mock_supabase):
        """Test successful event deletion by creator"""
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "creator_id": "user123"
        }]
        
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "role": "student"
        }]
        
        # Mock delete
        mock_delete = MagicMock()
        mock_delete.execute.return_value.data = [{"id": "event1"}]
        
        def table_side_effect(table_name):
            if table_name == "events":
                mock_events = MagicMock()
                mock_events.select.return_value.eq.return_value.execute.return_value = mock_event_response
                mock_events.delete.return_value.eq.return_value.execute.return_value = mock_delete
                return mock_events
            else:  # users
                mock_users = MagicMock()
                mock_users.select.return_value.eq.return_value.execute.return_value = mock_user_response
                return mock_users
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.delete("/events/event1?user_id=user123")
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"].lower()

    @patch('main.supabase')
    def test_delete_event_by_admin(self, mock_supabase):
        """Test event deletion by admin"""
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "creator_id": "user456"
        }]
        
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "admin_user",
            "role": "admin"
        }]
        
        # Mock delete
        mock_delete = MagicMock()
        mock_delete.execute.return_value.data = [{"id": "event1"}]
        
        def table_side_effect(table_name):
            if table_name == "events":
                mock_events = MagicMock()
                mock_events.select.return_value.eq.return_value.execute.return_value = mock_event_response
                mock_events.delete.return_value.eq.return_value.execute.return_value = mock_delete
                return mock_events
            else:  # users
                mock_users = MagicMock()
                mock_users.select.return_value.eq.return_value.execute.return_value = mock_user_response
                return mock_users
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.delete("/events/event1?user_id=admin_user")
        assert response.status_code == 200

    @patch('main.supabase')
    def test_delete_event_permission_denied(self, mock_supabase):
        """Test delete fails if user has no permission"""
        # Mock event fetch
        mock_event_response = MagicMock()
        mock_event_response.data = [{
            "id": "event1",
            "creator_id": "user456"
        }]
        
        # Mock user fetch
        mock_user_response = MagicMock()
        mock_user_response.data = [{
            "id": "user123",
            "role": "student"
        }]
        
        def table_side_effect(table_name):
            if table_name == "events":
                mock_events = MagicMock()
                mock_events.select.return_value.eq.return_value.execute.return_value = mock_event_response
                return mock_events
            else:  # users
                mock_users = MagicMock()
                mock_users.select.return_value.eq.return_value.execute.return_value = mock_user_response
                return mock_users
        
        mock_supabase.table.side_effect = table_side_effect
        
        response = client.delete("/events/event1?user_id=user123")
        assert response.status_code == 403
