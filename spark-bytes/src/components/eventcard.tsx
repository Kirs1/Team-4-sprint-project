"use client";

import { Card, Button, message } from "antd";
import { useState } from "react";

export default function EventCard({
  id,
  name,
  start_time,
  end_time,
  location_name,
  description,
  quantity_left,
  onRegister, // optional callback
  isRegistered, // boolean if user already registered
}: any) {
  const start = start_time ? new Date(start_time).toLocaleString() : "N/A";
  const end = end_time ? new Date(end_time).toLocaleString() : "N/A";

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [spotsLeft, setSpotsLeft] = useState(quantity_left);

  const handleRegister = async () => {
    if (!id) return;
    if (spotsLeft <= 0) {
      message.error("No spots left!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "CURRENT_USER_ID" }), // replace with session user id
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      message.success("Registered successfully!");
      setRegistered(true);
      setSpotsLeft((prev: number) => prev - 1);

      if (onRegister) onRegister(id); // callback for parent to update dashboard
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={name || "Unnamed Event"} style={{ borderRadius: "12px", minHeight: "150px" }}>
      <p>{description || "No description available."}</p>
      <p><strong>Start:</strong> {start}</p>
      <p><strong>End:</strong> {end}</p>
      {location_name && <p><strong>Location:</strong> {location_name}</p>}
      <p><strong>Spots left:</strong> {spotsLeft}</p>
      <Button
        type="primary"
        onClick={handleRegister}
        disabled={registered || spotsLeft <= 0}
        loading={loading}
      >
        {registered ? "Registered" : "Register"}
      </Button>
    </Card>
  );
}
