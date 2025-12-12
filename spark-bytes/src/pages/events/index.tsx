"use client";

import Link from "next/link";
import { Row, Col, Spin, Empty, Checkbox, Space } from "antd";
import EventCard from "../../components/eventcard";
import styles from "../../styles/eventcard.module.css";
import Layout from "../../components/layout";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOngoing, setFilterOngoing] = useState(false);
  const [filterKosher, setFilterKosher] = useState(false);
  const [filterHalal, setFilterHalal] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {console.log("Error fetching events:", err); setLoading(false);});
      // TODO: handle CORS error properly
  }, []);

  const filteredEvents = events.filter((event) => {
    let pass = true;

    // Ignore events already ended
    const now = dayjs();
    const end = dayjs(event.end_time);
    if (end.isValid() && end.isBefore(now)) {
      return false;
    }

    if (filterOngoing) {
      const start = dayjs(event.start_time);
      const endOngoing = dayjs(event.end_time);
      if (start.isValid() && endOngoing.isValid()) {
        pass = pass && now.isAfter(start) && now.isBefore(endOngoing);
      }
    }

    if (filterKosher) {
      const foodItems = event.food_items || [];
      pass = pass && foodItems.some((f: any) => f.is_kosher === true);
    }

    if (filterHalal) {
      const foodItems = event.food_items || [];
      pass = pass && foodItems.some((f: any) => f.is_halal === true);
    }

    return pass;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Upcoming Events</h1>
        <div style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <Checkbox checked={filterOngoing} onChange={(e) => setFilterOngoing(e.target.checked)}>
              Ongoing now
            </Checkbox>
            <Checkbox checked={filterKosher} onChange={(e) => setFilterKosher(e.target.checked)}>
              Kosher = Yes
            </Checkbox>
            <Checkbox checked={filterHalal} onChange={(e) => setFilterHalal(e.target.checked)}>
              Halal = Yes
            </Checkbox>
          </Space>
        </div>
        {loading ? (
          <Spin size="large" />
        ) : filteredEvents.length === 0 ? (
          <Empty description="No events available" />
        ) : (
        <Row gutter={[16, 16]}>
  {filteredEvents.length === 0 ? (
    <Empty description="No events available" />
  ) : (
    filteredEvents.map((event) => (
      <Col xs={24} sm={12} md={8} key={event.id}>
        <Link href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
          <EventCard
            name={event.name}
            start_time={event.start_time}
            end_time={event.end_time}
            location_name={event.location_name}
            description={event.description}
            quantity_left={event.quantity_left ?? "N/A"}
          />
        </Link>
      </Col>
    ))
  )}
</Row>
      )}
      </div>
    </Layout>
  );
}
