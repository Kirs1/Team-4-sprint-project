"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Tag, message } from "antd";
import { UserOutlined, CalendarOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Layout from "../../components/layout";
import styles from "../../styles/dashboard.module.css";

interface Event {
  id: string;
  name: string;
  start_time: string;
  location_name: string;
  description: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [interestedEvents, setInterestedEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [userStats, setUserStats] = useState<{ created_events: number }>({
    created_events: 0,
  });
  const router = useRouter();

  useEffect(() => {
  if (!userId) return; // Wait for session to load

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const allEventsRes = await fetch("http://127.0.0.1:8000/events");
      const allEvents = allEventsRes.ok ? await allEventsRes.json() : [];

      const userRes = await fetch(`http://127.0.0.1:8000/users/${userId}`);
      const userData = userRes.ok ? await userRes.json() : null;

      const createdRes = await fetch(`http://127.0.0.1:8000/users/${userId}/created-events`);
      const createdEvents = createdRes.ok ? await createdRes.json() : [];

      const interested =
        Array.isArray(userData?.registered_events)
          ? allEvents.filter((ev: Event) => userData.registered_events.includes(ev.id))
          : [];

      setInterestedEvents(interested);
      setCreatedEvents(createdEvents);

      setUserStats({
        created_events: userData?.created_events ?? createdEvents.length,
      });
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  if (status === "loading") {
    return <Layout><div>Loading session...</div></Layout>;
  }

  if (!session?.user) {
    return <Layout><div>Please log in</div></Layout>;
  }

  if (loading) {
    return <Layout><div>Loading dashboard...</div></Layout>;
  }

  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <h1>User Dashboard</h1>
          <div className={styles.userInfo}>
            <UserOutlined className={styles.userIcon} />
            <span className={styles.userName}>{session.user.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <CalendarOutlined /> Manage Notification
          </button>
          <button className={styles.actionButton} onClick={() => router.push("/events/create")}>
            <ShoppingOutlined /> Create Event
          </button>
        </div>

        <Row gutter={[24, 24]} className={styles.dashboardContent}>
          {/* Interested Events */}
          <Col xs={24} lg={12}>
            <Card title="Interested Events" className={styles.sectionCard}>
              {interestedEvents.length === 0 ? (
                <div className={styles.emptyState}>No interested events yet</div>
              ) : (
                <List
                  dataSource={interestedEvents}
                  renderItem={(event) => (
                    <List.Item className={styles.eventItem}>
                      <div className={styles.eventContent}>
                        <h4 className={styles.eventTitle}>{event.name}</h4>
                        <p className={styles.eventDate}>
                          {new Date(event.start_time).toLocaleString()}
                        </p>
                        <p className={styles.eventLocation}>{event.location_name}</p>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Stats + Created Events */}
          <Col xs={24} lg={12}>
            <Card title="My Stats" className={styles.sectionCard}>
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <Statistic
                    title="Created Events"
                    value={userStats.created_events}
                  />
                </Col>
              </Row>

              <div className={styles.createdEvents}>
                <h4>Created Events</h4>
                {createdEvents.length === 0 ? (
                  <div className={styles.emptyState}>No events created yet</div>
                ) : (
                  <List
                    size="small"
                    dataSource={createdEvents}
                    renderItem={(event) => (
                      <List.Item>
                        <span className={styles.createdEventTitle}>{event.name}</span>
                        <Tag color="blue">Active</Tag>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}
