"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Space,
  Divider,
} from "antd";
import Layout from "../../../components/layout";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Mock fetch for now
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEvent({
        id,
        title: "Campus Hackathon",
        date: "2025-11-15",
        location: "Main Auditorium",
        description:
          "Join us for a 24-hour coding marathon with prizes, mentors, and snacks!",
        foodCategories: [
          {
            category: "Snacks",
            items: [{ foodName: "Chips" }, { foodName: "Cookies" }],
          },
          {
            category: "Drinks",
            items: [{ foodName: "Coffee" }, { foodName: "Soda" }],
          },
        ],
      });
      setLoading(false);
    }, 400);
  }, [id]);

  const handleSave = (values: any) => {
    console.log("Updated section:", values);
    message.success("Event updated successfully!");
    setEditingSection(null);
  };

  if (loading || !event) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Paragraph>Loading event details...</Paragraph>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Card
          title={`Edit Event: ${event.title}`}
          bordered={false}
          style={{ maxWidth: 700, width: "100%" }}
        >
          {/* ===== Title Section ===== */}
          <Section
            title="Title"
            editing={editingSection === "title"}
            onEdit={() => setEditingSection("title")}
            onCancel={() => setEditingSection(null)}
          >
            {editingSection === "title" ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ title: event.title }}
              >
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: "Enter event title" }]}
                >
                  <Input placeholder="Event title" />
                </Form.Item>
                <SaveCancelButtons />
              </Form>
            ) : (
              <Paragraph>{event.title}</Paragraph>
            )}
          </Section>

          <Divider />

          {/* ===== Date Section ===== */}
          <Section
            title="Date"
            editing={editingSection === "date"}
            onEdit={() => setEditingSection("date")}
            onCancel={() => setEditingSection(null)}
          >
            {editingSection === "date" ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ date: dayjs(event.date) }}
              >
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: "Select a date" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <SaveCancelButtons />
              </Form>
            ) : (
              <Paragraph>{event.date}</Paragraph>
            )}
          </Section>

          <Divider />

          {/* ===== Location Section ===== */}
          <Section
            title="Location"
            editing={editingSection === "location"}
            onEdit={() => setEditingSection("location")}
            onCancel={() => setEditingSection(null)}
          >
            {editingSection === "location" ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ location: event.location }}
              >
                <Form.Item
                  name="location"
                  rules={[{ required: true, message: "Enter location" }]}
                >
                  <Input placeholder="Location" />
                </Form.Item>
                <SaveCancelButtons />
              </Form>
            ) : (
              <Paragraph>{event.location}</Paragraph>
            )}
          </Section>

          <Divider />

          {/* ===== Description Section ===== */}
          <Section
            title="Description"
            editing={editingSection === "description"}
            onEdit={() => setEditingSection("description")}
            onCancel={() => setEditingSection(null)}
          >
            {editingSection === "description" ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ description: event.description }}
              >
                <Form.Item
                  name="description"
                  rules={[{ required: true, message: "Enter a description" }]}
                >
                  <Input.TextArea rows={4} placeholder="Event description" />
                </Form.Item>
                <SaveCancelButtons />
              </Form>
            ) : (
              <Paragraph>{event.description}</Paragraph>
            )}
          </Section>

          <Divider />

          {/* ===== Food Section (static for now) ===== */}
          <Section title="Food & Categories" showEdit={false}>
            {event.foodCategories.map((cat: any, i: number) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <Title level={5}>{cat.category}</Title>
                <ul style={{ marginTop: "4px", marginBottom: "0" }}>
                  {cat.items.map((item: any, j: number) => (
                    <li key={j}>{item.foodName}</li>
                  ))}
                </ul>
              </div>
            ))}
            <Button type="dashed" block disabled>
              (Editing for this section coming soon)
            </Button>
          </Section>
        </Card>
      </div>
    </Layout>
  );
}

/** Small helper: section wrapper */
function Section({
  title,
  editing,
  onEdit,
  onCancel,
  showEdit = true,
  children,
}: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {showEdit &&
          (editing ? (
            <Button onClick={onCancel}>Cancel</Button>
          ) : (
            <Button type="link" onClick={onEdit}>
              Edit
            </Button>
          ))}
      </div>
      {children}
    </div>
  );
}

/** Small helper: save/cancel buttons inside forms */
function SaveCancelButtons() {
  return (
    <Space>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Space>
  );
}
