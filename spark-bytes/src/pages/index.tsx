import Layout from "../components/layout";
import styles from "../styles/home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className={styles.hero}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>Welcome to Spark!Bytes</h1>

          <div className={styles.buttons}>
            <Link href="/events" className={styles.button}>
                View Events →
            </Link>
            <Link href="/about" className={styles.button}>
              About us
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
