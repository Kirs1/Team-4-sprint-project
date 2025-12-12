"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Tag, message } from "antd";
import { UserOutlined, CalendarOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

      // 1. Fetch all events
      const allEventsRes = await fetch("http://127.0.0.1:8000/events");
      const allEvents: Event[] = allEventsRes.ok ? await allEventsRes.json() : [];

      // 2. Fetch user data
      const userRes = await fetch(`http://127.0.0.1:8000/users/${userId}`);
      const userData = userRes.ok ? await userRes.json() : null;

      // 3. Fetch events created by the user
      const createdRes = await fetch(`http://127.0.0.1:8000/users/${userId}/created-events`);
      const createdEvents: Event[] = createdRes.ok ? await createdRes.json() : [];


      const interestedRes = await fetch(`http://127.0.0.1:8000/users/${userId}/interested-events`);
      const interested: Event[] = interestedRes.ok ? await interestedRes.json() : [];
      setInterestedEvents(
        interested.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      );

      // 5. Set created events (sorted by date)
      const sortedCreated = createdEvents.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setCreatedEvents(sortedCreated);

      // 6. Set user stats safely
      setUserStats({
        created_events: userData?.created_events ?? createdEvents.length,
      });

      

    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      message.error("Failed to load dashboard data");
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

  const sendNotification = async () => {
    if (!session?.user?.email) {
      message.error("No email found for your account");
      return;
    }
    try {
      const res = await fetch("/api/auth/notif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: session.user.email,
          name: session.user.name || "User",
          subject: "Spark! Bytes Notification",
          intro: "You tapped Manage Notification on your dashboard.",
          content: "This is a test notification from Spark! Bytes.",
          link: "https://sparkbytes.com",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send notification");
      message.success("Notification sent to your email");
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Failed to send notification");
    }
  };

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
          <button className={styles.actionButton} onClick={sendNotification}>
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
              size="small"
              dataSource={interestedEvents}
              renderItem={(event) => (
                <List.Item
                  actions={[
                    <Link key="view" href={`/events/${event.id}`}>
                      View
                    </Link>,
                    <a
                      key="unregister"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(`http://127.0.0.1:8000/events/${event.id}/unregister`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: userId }),
                          });
                          if (!res.ok) throw new Error("Unregister failed");

                          message.success("Unregistered successfully!");

                          // Remove event from local state
                          setInterestedEvents((prev) => prev.filter((e) => e.id !== event.id));
                        } catch (err: any) {
                          message.error(err.message || "Failed to unregister");
                        }
                      }}
                    >
                      Unregister
                    </a>
                  ]}
                >
                  <span className={styles.createdEventTitle}>{event.name}</span>
                  <Tag color="green">Interested</Tag>
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
                      <List.Item
                        actions={[
                          <a onClick={() => router.push(`/events/${event.id}`)}>View</a>,
                          <a onClick={() => router.push(`/events/edit/${event.id}`)}>Edit</a>,
                          <a
                            style={{ color: "red" }}
                            onClick={async () => {
                              if (!confirm("Delete this event? This cannot be undone.")) return;
                              try {
                                const res = await fetch(`http://127.0.0.1:8000/events/${event.id}?user_id=${userId}`, {
                                  method: "DELETE",
                                });
                                if (!res.ok) {
                                  const err = await res.json();
                                  throw new Error(err.detail || "Delete failed");
                                }
                                message.success("Event deleted");
                                setCreatedEvents((prev) => prev.filter((e) => e.id !== event.id));
                              } catch (err: any) {
                                message.error(err.message || "Failed to delete event");
                              }
                            }}
                          >
                            Delete
                          </a>
                        ]}
                      >
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
      <div className="py-12 text-center">
  
</div>
</Layout>
  );
}
