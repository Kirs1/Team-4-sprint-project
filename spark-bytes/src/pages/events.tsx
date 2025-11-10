"use client";

import { Row, Col } from "antd";
import EventCard from "../components/eventcard";
import styles from "../styles/eventcard.module.css"
import Layout from "../components/layout";

const events = [
  {
    title: "",
    date: "",
    location: "",
    description:
      "",
  },
  
];

export default function EventsPage() {
  return (
    <Layout>
    <div className={styles.container}>
      <h1 className={styles.heading}>Upcoming Events</h1>
      <Row gutter={[16, 16]}>
        {events.map((event, i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <EventCard {...event} />
          </Col>
        ))}
      </Row>
    </div>
    </Layout>
  );
}
