"use client";

import Link from "next/link";
import { Row, Col } from "antd";
import EventCard from "../../components/eventcard";
import styles from "../../styles/eventcard.module.css"
import Layout from "../../components/layout";

const events = [
  {
    id: "1",
    title: "Campus Hackathon",
    date: "Nov 15, 2025",
    location: "Main Auditorium",
    description: "placeholder",
  },
  {
    id: "2",
    title: "Guest Lecture: AI in Education",
    date: "Nov 22, 2025",
    location: "Room 101, Science Building",
    description: "placeholder",
  },
];

export default function EventsPage() {
  return (
    <Layout>
    <div className={styles.container}>
      <h1 className={styles.heading}>Upcoming Events</h1>
      <Row gutter={[16, 16]}>
        {events.map((event, i) => (
          <Col xs={24} sm={12} md={8} key={event.id}>
            <Link href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
              <EventCard {...event} />
            </Link>
          </Col>
        ))}
      </Row>
    </div>
    </Layout>
  );
}
