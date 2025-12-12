"use client";

import { useState } from "react";
import { Form, Input, DatePicker, Button, Card, Space, message, TimePicker, InputNumber, Radio } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const { TextArea } = Input;

export default function CreateEventPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(session?.user || null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (!user) {
      message.error("Please log in to create events");
      return;
    }

    setLoading(true);
    
    try {
      // Format the date and time
      const start = values.date
        .hour(values.start_time.hour())
        .minute(values.start_time.minute())
        .second(0)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      const end = values.date
        .hour(values.end_time.hour())
        .minute(values.end_time.minute())
        .second(0)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss[Z]");

      
      const eventData = {
        name: values.title,
        description: values.description,
        location_name: values.location,
        start_time: start,
        end_time: end,
        capacity: values.capacity || 50,
        creator_id: user.id,
        creator_name: user.name,
        food_items: (values.foodItems || []).map((item: any) => ({
          name: item.foodName,
          allergy_info: item.allergies,
          is_kosher: item.kosher,
          is_halal: item.halal,
        })),
      };

      // Send POST request to create event
      const response = await fetch('http://127.0.0.1:8000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const result = await response.json();
        message.success('Event created successfully!');
        
        // Refresh user data to get updated created_events count
        if (user) {
          const userResponse = await fetch(`http://127.0.0.1:8000/users/${user.id}`);
          if (userResponse.ok) {
            const updatedUser = await userResponse.json();
            // You might want to update the user in your AuthContext here
          }
        }
        
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        message.error(`Failed to create event: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Card title="Access Denied" style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
            <p>Please log in to create events</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Card
          title="Create New Event"
          bordered={false}
          style={{ maxWidth: 700, width: "100%" }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Basic Info */}
            <Form.Item
              label="Event Title"
              name="title"
              rules={[{ required: true, message: "Please enter an event title" }]}
            >
              <Input placeholder="Enter event title" />
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Space.Compact block>
              <Form.Item
                label="Start Time"
                name="start_time"
                rules={[{ required: true, message: "Please select start time" }]}
                style={{ width: "50%", marginRight: 8 }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="End Time"
                name="end_time"
                rules={[{ required: true, message: "Please select end time" }]}
                style={{ width: "50%" }}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Space.Compact>

            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "Please enter a location" }]}
            >
              <Input placeholder="Enter event location" />
            </Form.Item>

            <Form.Item
              label="Capacity"
              name="capacity"
              initialValue={50}
            >
              <InputNumber
                min={1}
                max={1000}
                placeholder="Enter capacity"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <TextArea rows={4} placeholder="Enter event description" />
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

            {/* Submit */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create Event
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
