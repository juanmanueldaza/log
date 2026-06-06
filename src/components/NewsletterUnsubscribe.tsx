import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../styles/NewsletterConfirm.module.css";

const WEB3FORMS_KEY = "7f2ff679-541d-45f2-a384-0bffec8b671b";

type Status = "idle" | "processing" | "success" | "error";

export function NewsletterUnsubscribe() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  function handleUnsubscribe() {
    if (!token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link.");
      return;
    }

    setStatus("processing");
    const form = new FormData();
    form.append("access_key", WEB3FORMS_KEY);
    form.append("subject", "newsletter_unsubscribe");
    form.append("token", token);

    fetch("https://api.web3forms.com/submit", { method: "POST", body: form })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "Unsubscribe failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Try again.");
      });
  }

  if (status === "success") {
    return (
      <main role="main" id="main-content" className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.heading}>unsubscribed</h1>
          <p className={styles.text}>
            you've been removed from the list. no hard feelings.
          </p>
          <Link to="/" className={styles.link}>back to log</Link>
        </div>
      </main>
    );
  }

  return (
    <main role="main" id="main-content" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>unsubscribe</h1>
        <p className={styles.text}>
          {status === "error" ? message : "click below to unsubscribe from the newsletter."}
        </p>
        {status !== "error" && (
          <button
            onClick={handleUnsubscribe}
            disabled={status === "processing"}
            className={styles.button}
          >
            {status === "processing" ? "processing..." : "unsubscribe"}
          </button>
        )}
        <br />
        <Link to="/" className={styles.link}>back to log</Link>
      </div>
    </main>
  );
}
