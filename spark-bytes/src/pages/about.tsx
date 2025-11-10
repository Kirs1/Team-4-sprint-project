import Layout from "../components/layout";
import {Typography} from "antd";
import styles from "../styles/about.module.css"

const { Title, Paragraph } = Typography;


export default function About() {
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          <Title level={1} className={styles.title}>
            About Spark!Bytes
          </Title>
          
          <div className={styles.textSection}>
            <Paragraph className={styles.paragraph}>
              <strong>Spark!Bytes</strong> is a web application created through <strong>Boston
              University's Spark! program</strong> to reduce food waste and promote sustainability on campus.
              Our mission is to connect the BU community with surplus food from dining halls,
              campus events, and partner organizations — ensuring good food is shared rather than wasted.
            </Paragraph>

            <Paragraph className={styles.paragraph}>
              Spark!Bytes enables users to <strong>discover</strong> available food, receive
              <strong> notifications</strong> about nearby opportunities, and help <strong>manage</strong> the
              responsible distribution of resources across the BU community.
            </Paragraph>

            <Paragraph className={styles.paragraph}>
              The platform is open to <strong>BU students, faculty, and staff</strong> with valid BU accounts.
              Access is secure and managed to ensure fair use, transparency, and trust among community members.
            </Paragraph>

            <Paragraph className={styles.paragraph}>
              Developed by students in <strong>CS391</strong>, Spark!Bytes represents the innovation and
              community-driven spirit of BU — transforming technology into meaningful impact.
            </Paragraph>
          </div>
        </div>
      </div>
    </Layout>
  );
}