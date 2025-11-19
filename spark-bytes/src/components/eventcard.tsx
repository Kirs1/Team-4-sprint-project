"use client";

import { Card } from "antd";
import {Typography} from "antd";

const {Text, Paragraph} = Typography;
import styles from "../styles/eventcard.module.css";


// interface EventCardProps {
//   title: string;
//   date: string;
//   location: string;
//   description: string;
// }

export default function EventCard({ name, start_time, end_time, location_name, organizations }: any) {
  const start = start_time ? new Date(start_time).toLocaleString() : "N/A";
  const end = end_time ? new Date(end_time).toLocaleString() : "N/A";

  return (
    <Card title={name || "Unnamed Event"} style={{ borderRadius: "12px", minHeight: "150px" }}>
      <p><strong>Start:</strong> {start}</p>
      <p><strong>End:</strong> {end}</p>
      {location_name && <p><strong>Location:</strong> {location_name}</p>}
      {organizations?.name && <p><strong>Provided by:</strong> {organizations.name}</p>}
    </Card>
  );
}

//   return (
//     <Card
//       title={title}

//       className={styles.card}
//       headStyle={{
      
//         color: 'blue', 
        
//       }}
//       style={{
//         borderRadius: 12,
//         height: "100%",
//       }}
//     >
//       <p className={styles.date}><strong>Date:</strong> {date}</p>
//       <p className={styles.location}><strong>Location: </strong>{location}</p>
//       <p>{description}</p>
//     </Card>
//   );
// }