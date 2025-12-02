"use client";

import { Card, Button, message, Progress } from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import styles from "../styles/eventcard.module.css";

export default function EventCard({
  id,
  name,
  start_time,
  end_time,
  location_name,
  description,
  quantity_left,
  onRegister,
  isRegistered,
  total_quantity = 50, // fallback if backend doesn’t provide total
}: any) {
  const start = start_time ? new Date(start_time).toLocaleString() : "N/A";
  const end = end_time ? new Date(end_time).toLocaleString() : "N/A";

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [spotsLeft, setSpotsLeft] = useState(quantity_left);

  const handleRegister = async () => {
    if (spotsLeft <= 0) {
      message.error("No spots left!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "CURRENT_USER_ID" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      message.success("Registered successfully!");
      setRegistered(true);
      setSpotsLeft((prev: number) => prev - 1);

      if (onRegister) onRegister(id);
    } catch (err: any) {
      message.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const percentFilled = ((total_quantity - spotsLeft) / total_quantity) * 100;

  return (
    <div className={styles.card}>
     

      <Card bordered={false} className={styles.inner}>
        <h2 className={styles.title}>{name}</h2>
        <p className={styles.description}>{description}</p>

        <div className={styles.details}>
          <p>
            <ClockCircleOutlined /> <strong>Start:</strong> {start}
          </p>
          <p>
            <ClockCircleOutlined /> <strong>End:</strong> {end}
          </p>
          <p>
            <EnvironmentOutlined /> <strong>Location:</strong>{" "}
            {location_name || "TBA"}
          </p>
          <p>
            <TeamOutlined />{" "}
            <strong>Spots Left:</strong> {spotsLeft} / {total_quantity}
          </p>
        </div>

        <Progress
          percent={percentFilled}
          status={spotsLeft > 0 ? "active" : "exception"}
          strokeColor={spotsLeft > 0 ? "#22aa55" : "#cc0000"}
          className={styles.progress}
        />

        
      </Card>
    </div>
  );
}
