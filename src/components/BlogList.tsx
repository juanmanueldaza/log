import { Link } from "react-router-dom";
import { getAllPosts } from "../utils/markdown";
import { ThemeToggle } from "./ThemeToggle";
import { VisitorCounter } from "./VisitorCounter";
import styles from "../styles/BlogList.module.css";

export function BlogList() {
  const posts = getAllPosts();

  return (
    <main role="main">
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.siteTitle}>log</h1>
          <ThemeToggle />
        </div>
        <p className={styles.tagline}>
          Life Across The Edges
        </p>
      </header>

      <section>
        {posts.map((post) => (
          <article key={post.slug} className={styles.article}>
            <p className={styles.articleDate}>{post.date}</p>
            <h2 className={styles.articleTitle}>
              <Link to={`/post/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className={styles.articleDesc}>{post.description}</p>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>
          <small>
            &copy; {new Date().getFullYear()} &middot; Visitors: <VisitorCounter />
          </small>
        </p>
      </footer>
    </main>
  );
}
