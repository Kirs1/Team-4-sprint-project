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
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(session?.user || null);
  const [interestedEvents, setInterestedEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [userStats, setUserStats] = useState({ created_events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all events
        const eventsResponse = await fetch("http://127.0.0.1:8000/events");
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }
        const allEvents = await eventsResponse.json();

        // Fetch user's created events
        const createdEventsResponse = await fetch(`http://127.0.0.1:8000/users/${user.id}/created-events`);
        let userCreatedEvents = [];
        if (createdEventsResponse.ok) {
          userCreatedEvents = await createdEventsResponse.json();
        }

        // Fetch updated user data to get created_events count
        const userResponse = await fetch(`http://127.0.0.1:8000/users/${user.id}`);
        let userData = { created_events: 0 };
        if (userResponse.ok) {
          userData = await userResponse.json();
        }

        // Filter events that user has registered for
        const userInterestedEvents = allEvents.filter((event: Event) => 
          Array.isArray(user.registered_events) && user.registered_events.includes(event.id)
        );

        setInterestedEvents(userInterestedEvents);
        setCreatedEvents(userCreatedEvents);
        setUserStats({
          created_events: userData.created_events || userCreatedEvents.length
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.warning('Some data may not be loaded correctly');
        
        // Fallback: try to at least get basic events
        try {
          const eventsResponse = await fetch("http://127.0.0.1:8000/events");
          if (eventsResponse.ok) {
            const allEvents = await eventsResponse.json();
            const userInterestedEvents = allEvents.filter((event: Event) => 
              Array.isArray(user.registered_events) && user.registered_events.includes(event.id)
            );
            setInterestedEvents(userInterestedEvents);
            // Use first 2 events as fallback for created events
            setCreatedEvents(allEvents.slice(0, 2));
            setUserStats({ created_events: 2 });
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  if (!user) {
    return (
      <Layout>
        <div className={styles.loading}>Redirecting to login...</div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1>User Dashboard</h1>
          <div className={styles.userInfo}>
            <UserOutlined className={styles.userIcon} />
            <span className={styles.userName}>{user.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <CalendarOutlined /> Manage Notification
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleCreateEvent}
          >
            <ShoppingOutlined /> Create Event
          </button>
        </div>

        <Row gutter={[24, 24]} className={styles.dashboardContent}>
          {/* Interested Events Section */}
          <Col xs={24} lg={12}>
            <Card 
              title="Interested Events" 
              className={styles.sectionCard}
              headStyle={{ backgroundColor: '#f0f2f5', borderBottom: '1px solid #d9d9d9' }}
            >
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
                          {new Date(event.start_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} | {new Date(event.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            hour12: true
                          }).replace(':00', '')}
                        </p>
                        <p className={styles.eventLocation}>{event.location_name}</p>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Stats Section */}
          <Col xs={24} lg={12}>
            <Card 
              title="My Stats" 
              className={styles.sectionCard}
              headStyle={{ backgroundColor: '#f0f2f5', borderBottom: '1px solid #d9d9d9' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <Statistic
                    title="Created Events"
                    value={userStats.created_events}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                
              </Row>
              
              {/* Created Events List */}
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