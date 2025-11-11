"use client";

import { useEffect, useState } from "react";
import { Row, Col, Spin, Empty } from "antd";
import EventCard from "../../components/eventcard";
import styles from "../../styles/eventcard.module.css"
import Layout from "../../components/layout";
import { supabase } from "../../lib/supabaseClient";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        name,
        start_time,
        end_time,
        location_name,
        organizations (
          name
        )
      `);

      if (error) {
        console.error("Supabase error:", error);
      } else {
        console.log("Fetched events:", data);
        setEvents(data || []);
      }
      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <Layout>
    <div className={styles.container}>
      <h1 className={styles.heading}>Upcoming Events</h1>
        {loading ? (
          <Spin />
        ) : events.length === 0 ? (
          <Empty description="No food currently available" />
        ) : (
          <Row gutter={[16, 16]}>
            {events.map((event) => (
              <Col xs={24} sm={12} md={8} key={event.id}>
                <EventCard {...event} />
              </Col>
            ))}
          </Row>
        )}
    </div>
    </Layout>
  );
}
