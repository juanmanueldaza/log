import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllPosts } from "../utils/markdown";
import styles from "../styles/BlogList.module.css";

export function BlogList() {
  const posts = getAllPosts();

  return (
    <main role="main">
      <Helmet>
        <title>log — Life Across The Edges</title>
        <meta name="description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:title" content="log — Life Across The Edges" />
        <meta property="og:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://log.daza.ar" />
        <meta property="og:image" content="https://log.daza.ar/og-default.png" />
        <meta property="og:site_name" content="log" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="log — Life Across The Edges" />
        <meta name="twitter:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta name="twitter:image" content="https://log.daza.ar/og-default.png" />
        <link rel="canonical" href="https://log.daza.ar" />
      </Helmet>
      <header className={styles.header}>
        <h1 className={styles.siteTitle}>log</h1>
        <p className={styles.tagline}>
          Life Across The Edges
        </p>
        <p className={styles.author}>
          by <a href="https://daza.ar">Juan Manuel Daza</a>
        </p>
      </header>

      <section>
        {posts.map((post) => (
          <article key={post.slug} className={styles.article}>
            <p className={styles.articleDate}>{post.date}</p>
            <h2 className={styles.articleTitle}>
              <Link to={`/${post.slug}`}>{post.title}</Link>
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
          &copy; {new Date().getFullYear()} <a href="https://daza.ar">Juan Manuel Daza</a>
        </p>
      </footer>
    </main>
  );
}