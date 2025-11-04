import Layout from "../components/layout";
import {Typography} from "antd";

const { Title, Paragraph } = Typography;


export default function About() {
  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          About Spark!Bytes
        </Title>

        <Paragraph>
          <strong>Spark!Bytes</strong> is a web application created through <strong>Boston
          University's Spark! program</strong> to reduce food waste and promote sustainability on campus.
          Our mission is to connect the BU community with surplus food from dining halls,
          campus events, and partner organizations — ensuring good food is shared rather than wasted.
        </Paragraph>

        <Paragraph>
          Spark!Bytes enables users to <strong>discover</strong> available food, receive
          <strong>notifications</strong> about nearby opportunities, and help <strong>manage</strong> the
          responsible distribution of resources across the BU community.
        </Paragraph>

        <Paragraph>
          The platform is open to <strong>BU students, faculty, and staff</strong> with valid BU accounts.
          Access is secure and managed to ensure fair use, transparency, and trust among community members.
        </Paragraph>

     

        <Paragraph>
          Developed by students in <strong>CS391</strong>, Spark!Bytes represents the innovation and
          community-driven spirit of BU — transforming technology into meaningful impact.
        </Paragraph>
      </div>
    </Layout>
  );
}