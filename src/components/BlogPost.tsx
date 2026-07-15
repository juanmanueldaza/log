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
    <main id="main-content">
      <Helmet>
        <title>{post.title} — log</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="log" />
        <meta property="article:published_time" content={post.dateISO} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:creator" content="@juanmanueldaza" />
        <meta name="theme-color" content="#0d1b2a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f0e1" media="(prefers-color-scheme: light)" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.dateISO,
          "author": {
            "@type": "Person",
            "name": "Juan Manuel Daza",
            "url": "https://daza.ar"
          },
          "url": canonicalUrl,
          "image": ogImage,
          "publisher": {
            "@type": "Organization",
            "name": "log",
            "logo": {
              "@type": "ImageObject",
              "url": "https://log.daza.ar/favicon.svg"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        })}</script>
      </Helmet>
      <header className={styles.header}>
        <h1>{post.title}</h1>
      </header>
      <article className={styles.post}>
        <time className={styles.postMeta} dateTime={post.dateISO}>{post.date}</time>
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