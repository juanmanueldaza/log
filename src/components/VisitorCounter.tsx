import { useState, useEffect } from "react";
import { Blink } from "./Blink";
import countapi from "countapi-js";
import styles from "../styles/VisitorCounter.module.css";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await countapi.hit("ukfmwdrfisdj2q38743269432", "admir");
        setCount(result.value);
      } catch (err) {
        console.error("Visitor counter error:", err);
        setError(true);
        setCount(1337);
      }
    };

    fetchCount();
  }, []);

  if (error && count === 1337) {
    return (
      <span className={styles.counter}>
        <Blink>{count.toLocaleString()}</Blink>
      </span>
    );
  }

  if (count === null) {
    return <span className={styles.loading}>...</span>;
  }

  return (
    <span className={styles.counter}>
      <Blink>{count.toLocaleString()}</Blink>
    </span>
  );
}
