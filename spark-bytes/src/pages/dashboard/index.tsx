"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Tag } from "antd";
import { UserOutlined, CalendarOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/authcontext"; // Fixed import path
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
  const { user } = useAuth();
  const [interestedEvents, setInterestedEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch user's interested events (registered events)
    fetch("http://127.0.0.1:8000/events")
      .then((res) => res.json())
      .then((allEvents) => {
        // Filter events that user has registered for
        const userInterestedEvents = allEvents.filter((event: Event) => 
          user.registered_events?.includes(event.id)
        );
        setInterestedEvents(userInterestedEvents);
        
        // For demo, let's assume user created some events
        setCreatedEvents(allEvents.slice(0, 2)); // Mock: first 2 events as created
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching events:", err);
        setLoading(false);
      });
  }, [user, router]);

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  if (!user) {
    return <div className={styles.loading}>Redirecting to login...</div>;
  }

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1>User Dashboard</h1>
          <div className={styles.userInfo}>
            <UserOutlined className={styles.userIcon} />
            <span className={styles.userName}>{user.full_name}</span>
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
                    value={createdEvents.length}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12}>
                  <Statistic
                    title="Food Saved"
                    value={100}
                    suffix="Kg"
                    prefix={<ShoppingOutlined />}
                    valueStyle={{ color: '#52c41a' }}
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