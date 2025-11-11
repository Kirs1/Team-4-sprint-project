"use client";

import { useRouter } from "next/router";
import { Card, Typography } from "antd";
import Layout from "../../../components/layout";

const { Title, Paragraph } = Typography;

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Placeholder data — later you'll fetch this from your API using `id`
  const event = {
    title: `Event ${id}`,
    date: "TBD",
    location: "Unknown",
    description: "Event details will be available soon.",
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Card
          title={<Title level={2}>{event.title}</Title>}
          bordered={false}
          style={{ maxWidth: 600, width: "100%", textAlign: "left" }}
        >
          <Paragraph>
            <strong>Date:</strong> {event.date}
          </Paragraph>
          <Paragraph>
            <strong>Location:</strong> {event.location}
          </Paragraph>
          <Paragraph>{event.description}</Paragraph>
        </Card>
      </div>
    </Layout>
  );
}
