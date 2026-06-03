import { Link } from "react-router-dom";
import { getAllPosts } from "../utils/markdown";
import styles from "../styles/BlogList.module.css";

export function BlogList() {
  const posts = getAllPosts();

  return (
    <main role="main">
      <header className={styles.header}>
        <h1 className={styles.siteTitle}>log</h1>
        <p className={styles.tagline}>
          Life Across The Edges
        </p>
        <p className={styles.author}>
          by Juan Manuel Daza
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
        <p className={styles.socialLinks}>
          <a href="https://linkedin.com/in/juanmanueldaza">LinkedIn</a>
          {" · "}
          <a href="https://github.com/juanmanueldaza">GitHub</a>
          {" · "}
          <a href="https://gitlab.com/juanmanueldaza">GitLab</a>
          {" · "}
          <a href="https://pypi.org/user/juanmanueldaza/">PyPI</a>
          {" · "}
          <a href="mailto:juanmanueldaza@gmail.com">Email</a>
        </p>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Juan Manuel Daza
        </p>
      </footer>
    </main>
  );
}
