"use client";

import { Card } from "antd";

export default function EventCard({ name, start_time, end_time, location_name, description }: any) {
  console.log("EventCard props:", { name, start_time, end_time, location_name });
  const start = start_time ? new Date(start_time).toLocaleString() : "N/A";
  const end = end_time ? new Date(end_time).toLocaleString() : "N/A";

  return (
    <Card title={name || "Unnamed Event"} style={{ borderRadius: "12px", minHeight: "150px" }}>
      <p>{description || "No description available."}</p>
      <p><strong>Start:</strong> {start}</p>
      <p><strong>End:</strong> {end}</p>
      {location_name && <p><strong>Location:</strong> {location_name}</p>}
    </Card>
  );
}
