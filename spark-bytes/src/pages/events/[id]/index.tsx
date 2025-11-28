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

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`http://127.0.0.1:8000/events/${id}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || data.length === 0) {
          setEvent(null);
        } else {
          const evt = Array.isArray(data) ? data[0] : data;
          setEvent(evt);

          // Check if user is already registered
          if (session?.user && evt.registered_users?.includes(userId)) {
            setIsRegistered(true);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setEvent(null);
        setLoading(false);
      });
  }, [id, session, userId]);

  const handleRegister = async () => {
    if (!userId || !event) return;

    if (event.quantity_left <= 0) {
      message.error("No spots left!");
      return;
    }

    setRegistering(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.id }),
      });

      if (!res.ok) throw new Error("Registration failed");

      message.success("Registered successfully!");
      setIsRegistered(true);
      setEvent((prev: any) => ({
        ...prev,
        quantity_left: prev.quantity_left - 1,
        registered_users: [...(prev.registered_users || []), userId],
      }));
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Event not found</h2>
          <p>The event you’re looking for does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Card
          title={<Title level={2}>{event.name}</Title>}
          bordered={false}
          style={{ maxWidth: 600, width: "100%", textAlign: "left" }}
        >
          <Paragraph>
            <strong>Date:</strong> {event.start_time ? new Date(event.start_time).toLocaleString() : "N/A"}
          </Paragraph>
          <Paragraph>
            <strong>Location:</strong> {event.location_name}
          </Paragraph>
          <Paragraph>{event.description}</Paragraph>
          <Paragraph>
            <strong>Spots left:</strong> {event.quantity_left}
          </Paragraph>
          <Button
            type="primary"
            onClick={handleRegister}
            disabled={isRegistered || event.quantity_left <= 0}
            loading={registering}
          >
            {isRegistered ? "Registered" : "Register"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
