"use client";

import Link from "next/link";
import { Row, Col, Spin, Empty } from "antd";
import EventCard from "../../components/eventcard";
import styles from "../../styles/eventcard.module.css";
import Layout from "../../components/layout";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {console.log("Error fetching events:", err); setLoading(false);});
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Upcoming Events</h1>
        {loading ? (
          <Spin size="large" />
        ) : events.length === 0 ? (
          <Empty description="No events available" />
        ) : (
        <Row gutter={[16, 16]}>
          {events.map((event) => (
            <Col xs={24} sm={12} md={8} key={event.id}>
              <Link href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                <EventCard
                  title={event.name}
                  date={event.start_time}
                  location={event.location_name}     
                  description={event.description}  
                />
              </Link>
            </Col>
          ))}
        </Row>
      )}
      </div>
    </Layout>
  );
}
