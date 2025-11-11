"use client";

import { Form, Input, DatePicker, Button, Card, Space, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Layout from "../../components/layout";
import { useRouter } from "next/router";

export default function CreateEventPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = (values: any) => {
    console.log("Event created:", values);
    message.success("Event created successfully!");
    // You could POST this to an API later:
    // await fetch("/api/events", { method: "POST", body: JSON.stringify(values) });
    router.push("/events");
  };

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
              label="Title"
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

            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "Please enter a location" }]}
            >
              <Input placeholder="Enter event location" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter event description" />
            </Form.Item>

            {/* Dynamic Food & Categories */}
            <Form.List name="foodCategories">
              {(fields, { add, remove }) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Food Categories</h3>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add Category
                    </Button>
                  </div>

                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      style={{ marginBottom: 16 }}
                      title={
                        <Space align="center">
                          <Form.Item
                            {...restField}
                            name={[name, "category"]}
                            rules={[
                              { required: true, message: "Enter a category name" },
                            ]}
                            noStyle
                          >
                            <Input placeholder="Category name" />
                          </Form.Item>
                        </Space>
                      }
                      extra={
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: "red" }}
                        />
                      }
                    >
                      {/* Nested Form.List for items */}
                      <Form.List name={[name, "items"]}>
                        {(itemFields, { add: addItem, remove: removeItem }) => (
                          <>
                            {itemFields.map(({ key: itemKey, name: itemName, ...itemRest }) => (
                              <Space
                                key={itemKey}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...itemRest}
                                  name={[itemName, "foodName"]}
                                  rules={[
                                    { required: true, message: "Enter a food item" },
                                  ]}
                                >
                                  <Input placeholder="Food item name" />
                                </Form.Item>
                                <MinusCircleOutlined
                                  onClick={() => removeItem(itemName)}
                                />
                              </Space>
                            ))}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addItem()}
                                icon={<PlusOutlined />}
                                block
                              >
                                Add Food Item
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  ))}
                </>
              )}
            </Form.List>

            {/* Submit */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create Event
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
