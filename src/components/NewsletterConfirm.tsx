import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../styles/NewsletterConfirm.module.css";

const WEB3FORMS_KEY = "7f2ff679-541d-45f2-a384-0bffec8b671b";

type Status = "processing" | "success" | "error";

export function NewsletterConfirm() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    // POST to Web3Forms — this will email us, and newsletter-manage sync picks it up
    const form = new FormData();
    form.append("access_key", WEB3FORMS_KEY);
    form.append("subject", "newsletter_confirm");
    form.append("token", token);

    fetch("https://api.web3forms.com/submit", { method: "POST", body: form })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "Confirmation failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Try again.");
      });
  }, [token]);

  return (
    <main role="main" id="main-content" className={styles.page}>
      {status === "processing" && (
        <div className={styles.card}>
          <h1 className={styles.heading}>confirming&hellip;</h1>
          <p className={styles.text}>one moment.</p>
        </div>
      )}

      {status === "success" && (
        <div className={styles.card}>
          <h1 className={styles.heading}>confirmed</h1>
          <p className={styles.text}>
            you're on the list. you'll receive the next newsletter.
          </p>
          <Link to="/" className={styles.link}>back to log</Link>
        </div>
      )}

      {status === "error" && (
        <div className={styles.card}>
          <h1 className={styles.heading}>something's off</h1>
          <p className={styles.text}>{message || "this confirmation link didn't work."}</p>
          <Link to="/" className={styles.link}>back to log</Link>
        </div>
      )}
    </main>
  );
}
