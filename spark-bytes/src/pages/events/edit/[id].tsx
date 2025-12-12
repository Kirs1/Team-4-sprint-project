"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "../../../components/layout";
import { Form, Input, Button, DatePicker, message, Card, InputNumber, Radio, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
        const event = Array.isArray(data) ? data[0] : data;

        const foodItems = Array.isArray(event.food_items) ? event.food_items : [];

        // Prefill the form
        form.setFieldsValue({
          name: event.name,
          description: event.description,
          location_name: event.location_name,
          start_time: event.start_time ? dayjs(event.start_time) : null,
          end_time: event.end_time ? dayjs(event.end_time) : null,
          capacity: event.quantity_left ? Number(event.quantity_left) : undefined,
          foodItems: foodItems.map((item: any) => ({
            foodName: item.name,
            allergies: item.allergy_info,
            kosher: item.is_kosher,
            halal: item.is_halal,
          })),
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
          start_time: values.start_time?.toISOString(),
          end_time: values.end_time?.toISOString(),
          capacity: values.capacity,
          food_items: (values.foodItems || []).map((item: any) => ({
            name: item.foodName,
            allergy_info: item.allergies,
            is_kosher: item.kosher,
            is_halal: item.halal,
          })),
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

          <Form.Item
            label="End Time"
            name="end_time"
            rules={[{ required: true, message: "Please select an end time" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Capacity" name="capacity">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* Food items (flat list) */}
          <Form.List name="foodItems">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>Food Items</h3>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Food Item
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12 }}
                    title={`Food Item ${name + 1}`}
                    extra={<MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />}
                  >
                    <Space direction="vertical" style={{ width: "100%" }} size={10}>
                      <Form.Item
                        {...restField}
                        label="Food name"
                        name={[name, "foodName"]}
                        rules={[{ required: true, message: "Please enter food name" }]}
                      >
                        <Input placeholder="e.g., Pizza" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Any allergies"
                        name={[name, "allergies"]}
                        rules={[
                          { required: true, message: "Please specify allergies (type 'None' if not applicable)" },
                        ]}
                      >
                        <Input placeholder="e.g., Dairy, Nuts, Egg, or None" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Is this kosher?"
                        name={[name, "kosher"]}
                        rules={[{ required: true, message: "Please select kosher status" }]}
                      >
                        <Radio.Group optionType="button" buttonStyle="solid">
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Is this halal?"
                        name={[name, "halal"]}
                        rules={[{ required: true, message: "Please select halal status" }]}
                      >
                        <Radio.Group optionType="button" buttonStyle="solid">
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form>
      </Card>
    </Layout>
  );
}
