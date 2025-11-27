"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "../../../components/layout";
import { Form, Input, Button, DatePicker, message, Card } from "antd";
import dayjs from "dayjs";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // Fetch event details
  useEffect(() => {
    if (!id || !userId) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/events/${id}?user_id=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();

        // Prefill the form
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          location_name: data.location_name,
          start_time: dayjs(data.start_time),
        });
      } catch (err) {
        console.error(err);
        message.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, userId]);

  // Submit changes
  const handleSubmit = async (values: any) => {
    if (!userId) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/events/${id}?user_id=${userId}`, {
        method: "PUT", // Must match backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          start_time: values.start_time.toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Update failed");
      }

      message.success("Event updated successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      message.error(`Failed to update event: ${err.message}`);
    }
  };

  if (status === "loading") return <Layout><div>Loading session...</div></Layout>;
  if (!session) return <Layout><div>Please log in</div></Layout>;
  if (loading) return <Layout><div>Loading event...</div></Layout>;

  return (
    <Layout>
      <Card style={{ maxWidth: 600, margin: "20px auto" }}>
        <h1>Edit Event</h1>

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Event Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location_name"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Start Time"
            name="start_time"
            rules={[{ required: true, message: "Please select a start time" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form>
      </Card>
    </Layout>
  );
}
