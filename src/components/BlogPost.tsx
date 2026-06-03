import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllPosts } from "../utils/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../styles/BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams();
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main>
        <div className={styles.notFound}>
          <h1>404</h1>
          <p>Post not found.</p>
          <p>
            <Link to="/">&larr; Home</Link>
          </p>
        </div>
      </main>
    );
  }

  const ogImage = `https://log.daza.ar/og-${post.slug}.png`;
  const canonicalUrl = `https://log.daza.ar/${post.slug}`;

  return (
    <main>
      <Helmet>
        <title>{post.title} — log</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="log" />
        <meta property="article:published_time" content={post.dateISO} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <header className={styles.header}>
        <h1>{post.title}</h1>
      </header>
      <article className={styles.post}>
        <p className={styles.postMeta}>{post.date}</p>
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
        <footer className={styles.backLink}>
          <Link to="/">&larr; Home</Link>
        </footer>
      </article>
    </main>
  );
}