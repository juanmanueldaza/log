import { useState, FormEvent } from "react";
import styles from "../styles/NewsletterSignup.module.css";

const WEB3FORMS_KEY = "7f2ff679-541d-45f2-a384-0bffec8b671b";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;

    setStatus("sending");
    try {
      const form = new FormData();
      form.append("access_key", WEB3FORMS_KEY);
      form.append("subject", "newsletter_subscribe");
      form.append("name", name);
      form.append("email", email);
      form.append("consent", "true");

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Check your email to confirm your subscription.");
        setEmail("");
        setName("");
        setConsent(false);
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  if (status === "success") {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>newsletter</h2>
        <div className={styles.success}>
          <p>check your email &mdash; you'll need to click the confirmation link.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>newsletter</h2>
      <p className={styles.blurb}>
        occasional updates when there's something new. no spam, no schedule.
      </p>
      <p className={styles.rssBlurb}>
        also available via <a href="/feed.xml">RSS</a>.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldRow}>
          <input
            type="text"
            placeholder="name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={!email || !consent || status === "sending"}
            className={styles.button}
          >
            {status === "sending" ? "sending..." : "subscribe"}
          </button>
        </div>

        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>i want to receive email updates from log.daza.ar</span>
        </label>

        {status === "error" && <p className={styles.error}>{message}</p>}
      </form>
    </section>
  );
}
