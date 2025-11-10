"use client";

import { Card } from "antd";
import {Typography} from "antd";

const {Text, Paragraph} = Typography;
import styles from "../styles/eventcard.module.css";


interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
}

export default function EventCard({ title, date, location, description }: EventCardProps) {
  return (
    <Card
      title={title}

      className={styles.card}
      headStyle={{
      
        color: 'blue', 
        
      }}
      style={{
        borderRadius: 12,
        height: "100%",
      }}
    >
      <p className={styles.date}><strong>Date:</strong> {date}</p>
      <p className={styles.location}><strong>Location: </strong>{location}</p>
      <p>{description}</p>
    </Card>
  );
}