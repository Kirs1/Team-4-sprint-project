"use client";

import { useRouter } from "next/router";
import { Card, Typography } from "antd";
import Layout from "../../../components/layout";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`http://127.0.0.1:8000/events/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          // API returned 404/500/etc.
          return null;
        }
        return res.json();
      })
      .then((data) => {
        // Handle cases:
        // - null response
        // - empty array
        // - missing data
        if (!data || data.length === 0) {
          setEvent(null);
        } else {
          setEvent(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

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
        </Card>
      </div>
    </Layout>
  );
}
