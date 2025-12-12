"use client";

import { useRouter } from "next/router";
import { Card, Typography, Button, message } from "antd";
import Layout from "../../../components/layout";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const { Title, Paragraph } = Typography;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  // Fetch user's registered events when session is available
  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;

    fetch(`http://127.0.0.1:8000/users/${session.user.id}`)
      .then(async (res) => {
        if (!res.ok) {
          console.warn("Could not fetch user data for registration check");
          return null;
        }
        return res.json();
      })
      .then((userData) => {
        if (userData?.registered_events && Array.isArray(userData.registered_events)) {
          setUserRegisteredEvents(userData.registered_events);
        }
      })
      .catch((err) => {
        console.error("Error fetching user registered events:", err);
      });
  }, [session, status]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`http://127.0.0.1:8000/events`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((allEvents) => {
        if (!allEvents || allEvents.length === 0) {
          setEvent(null);
          setLoading(false);
          return;
        }

        // Find the specific event by ID - handle both string and number IDs
        const foundEvent = allEvents.find((evt: any) => {
          // Try to match as string first, then as number
          return evt.id.toString() === id || 
                 parseInt(evt.id) === parseInt(id as string);
        });
        
        if (!foundEvent) {
          setEvent(null);
        } else {
          setEvent(foundEvent);

          // Check if user is the creator of this event
          if (session?.user?.id && foundEvent.creator_id === session.user.id) {
            setIsCreator(true);
          }

          // Check if user is already registered
          if (session?.user?.id) {
            const eventIdStr = foundEvent.id.toString();
            const isUserRegistered = userRegisteredEvents.includes(eventIdStr);
            setIsRegistered(isUserRegistered);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvent(null);
        setLoading(false);
      });
  }, [id, session, userRegisteredEvents]);

  const handleRegister = async () => {
    if (!session?.user?.id) {
      message.error("Please log in to register for events");
      return;
    }

    if (!event) {
      message.error("Event not found");
      return;
    }

    // Prevent creators from registering for their own events
    if (isCreator) {
      message.error("You cannot register for events you created");
      return;
    }

    // Convert quantity_left to number for comparison
    const quantityLeft = parseInt(event.quantity_left) || 0;
    if (quantityLeft <= 0) {
      message.error("No spots left!");
      return;
    }

    if (isRegistered) {
      message.info("You are already registered for this event");
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/events/${event.id}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          user_id: session.user.id 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Registration failed");
      }

      message.success(data.message || "Registered successfully!");
      setIsRegistered(true);
      
      // Update the user's registered events list locally
      setUserRegisteredEvents([...userRegisteredEvents, event.id.toString()]);
      
      // Update event quantity left
      setEvent((prev: any) => ({
        ...prev,
        quantity_left: (quantityLeft - 1).toString(),
      }));
      
      // Send notification email using internal notif API
      try {
        await fetch("/api/auth/notif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: session?.user?.email || session?.user?.id,
            name: session?.user?.name || session?.user?.email || "User",
            subject: `Registered: ${event.name}`,
            intro: `You have successfully registered for the event \"${event.name}\".`,
            content: `Event details:\nDate: ${event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}\nLocation: ${event.location_name}`,
          }),
        });
      } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      message.error(err.message || "Failed to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading event details...</p>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Event not found</h2>
          <p>The event you're looking for does not exist.</p>
          <Button type="primary" onClick={() => router.push("/events")}>
            Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  // Determine button state and text
  const getButtonState = () => {
    if (!session?.user?.id) {
      return { text: "Login to Register", disabled: true };
    }
    if (isCreator) {
      return { text: "You Created This Event", disabled: true };
    }
    if (isRegistered) {
      return { text: "Registered ✓", disabled: true };
    }
    if (parseInt(event.quantity_left) <= 0) {
      return { text: "Full", disabled: true };
    }
    return { text: "Register Now", disabled: false };
  };

  const buttonState = getButtonState();

  const handleDelete = async () => {
    if (!session?.user?.id) return;
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/events/${event.id}?user_id=${session.user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Delete failed");
      }
      message.success("Event deleted");
      router.push("/events");
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to delete event");
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Card
          title={<Title level={2}>{event.name}</Title>}
          bordered={false}
          style={{ maxWidth: 700, width: "100%", textAlign: "left" }}
        >
          <Paragraph>
            <strong>Date & Time:</strong> {event.start_time ? new Date(event.start_time).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }) : "N/A"}
          </Paragraph>
          
          {event.end_time && (
            <Paragraph>
              <strong>Ends:</strong> {new Date(event.end_time).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Paragraph>
          )}
          
          <Paragraph>
            <strong>Location:</strong> {event.location_name}
          </Paragraph>

          <Paragraph>
            <strong>Description:</strong> {event.description}
          </Paragraph>

          {Array.isArray(event.food_items) && event.food_items.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <strong>Food Items:</strong>
              <ul style={{ marginTop: 8 }}>
                {event.food_items.map((food: any) => (
                  <li key={food.id || food.name}>
                    {food.name}
                    {food.category ? ` (${food.category})` : ""}
                    {food.allergy_info ? ` — Allergy: ${food.allergy_info}` : ""}
                    {food.is_kosher !== undefined ? ` | Kosher: ${food.is_kosher ? "Yes" : "No"}` : ""}
                    {food.is_halal !== undefined ? ` | Halal: ${food.is_halal ? "Yes" : "No"}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Paragraph>
            <strong>Available Spots:</strong> {event.quantity_left}
          </Paragraph>
          
          {isCreator && (
            <Paragraph style={{ color: "#1890ff", fontWeight: "bold" }}>
              ✨ You created this event
            </Paragraph>
          )}
          
          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              disabled={buttonState.disabled}
              loading={registering}
              style={{
                backgroundColor: isRegistered ? "#52c41a" : isCreator ? "#1890ff" : undefined,
                borderColor: isRegistered ? "#52c41a" : isCreator ? "#1890ff" : undefined,
                cursor: buttonState.disabled ? "not-allowed" : "pointer",
                minWidth: "160px"
              }}
              onClick={buttonState.disabled ? undefined : handleRegister}
              size="large"
            >
              {buttonState.text}
            </Button>
            
            {!session?.user?.id && (
              <Paragraph style={{ marginTop: "10px", color: "#fa8c16" }}>
                Please log in to register for this event
              </Paragraph>
            )}
            
            {isCreator && (
              <Paragraph style={{ marginTop: "10px", color: "#1890ff", fontWeight: "bold" }}>
                As the event creator, you cannot register for your own event
              </Paragraph>
            )}
            
            {isRegistered && !isCreator && (
              <Paragraph style={{ marginTop: "10px", color: "#52c41a", fontWeight: "bold" }}>
                ✅ You are registered for this event
              </Paragraph>
            )}
            
            {parseInt(event.quantity_left) <= 0 && !isRegistered && !isCreator && (
              <Paragraph style={{ marginTop: "10px", color: "#ff4d4f", fontWeight: "bold" }}>
                ❌ This event is full
              </Paragraph>
            )}
          </div>
          
          <div style={{ marginTop: "30px", display: "flex", gap: 12 }}>
            <Button onClick={() => router.push("/events")}>
              Back to All Events
            </Button>
            {isCreator && (
              <Button danger onClick={handleDelete}>
                Delete Event
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
