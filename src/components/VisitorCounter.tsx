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
        // Create or hit a counter for your site
        // const result = await countapi.visits()
        countapi.hit('ukfmwdrfisdj2q38743269432', 'admir').then((result) => {
          console.log(result.value);
        });
        // setCount(result);
      } catch (err) {
        console.error("Error fetching visitor count:", err);
        setError(true);
        // Fallback to a static number for the 90s feel
        setCount(1337);
      }
    };

    fetchCount();
  }, []);

  if (error) {
    return (
      <span className={styles.counter}>
        <Blink>1337</Blink>
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
