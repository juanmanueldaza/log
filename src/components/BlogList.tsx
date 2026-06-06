import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllPosts } from "../utils/markdown";
import styles from "../styles/BlogList.module.css";
import { NewsletterSignup } from "./NewsletterSignup";

export function BlogList() {
  const posts = getAllPosts();

  return (
    <main role="main" id="main-content">
      <Helmet>
        <title>log — Life Across The Edges</title>
        <meta name="description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:title" content="log — Life Across The Edges" />
        <meta property="og:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://log.daza.ar" />
        <meta property="og:image" content="https://log.daza.ar/og-default.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="log" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="log — Life Across The Edges" />
        <meta name="twitter:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta name="twitter:image" content="https://log.daza.ar/og-default.png" />
        <meta name="twitter:creator" content="@juanmanueldaza" />
        <meta name="theme-color" content="#0B0B0D" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#FDFBF7" media="(prefers-color-scheme: light)" />
        <link rel="canonical" href="https://log.daza.ar" />
        <link rel="alternate" type="application/atom+xml" title="log — Life Across The Edges" href="/feed.xml" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "log",
          "alternateName": "Life Across The Edges",
          "url": "https://log.daza.ar",
          "description": "Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows.",
          "author": {
            "@type": "Person",
            "name": "Juan Manuel Daza",
            "url": "https://daza.ar"
          }
        })}</script>
      </Helmet>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
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

\n      <NewsletterSignup />
      <footer className={styles.footer}>
        <p className={styles.socialLinks}>
          <a href="https://linkedin.com/in/juanmanueldaza" rel="me">LinkedIn</a>
          {" · "}
          <a href="https://github.com/juanmanueldaza" rel="me">GitHub</a>
          {" · "}
          <a href="https://gitlab.com/juanmanueldaza" rel="me">GitLab</a>
          {" · "}
          <a href="https://pypi.org/user/juanmanueldaza/" rel="me">PyPI</a>
          {" · "}
          <a href="mailto:juan@daza.ar" rel="me">Email</a>
        </p>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} <a href="https://daza.ar">Juan Manuel Daza</a>
        </p>
      </footer>
    </main>
  );
}