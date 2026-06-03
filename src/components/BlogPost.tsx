import { useParams, Link } from "react-router-dom";
import { getAllPosts } from "../utils/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThemeToggle } from "./ThemeToggle";
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

  return (
    <main>
      <header className={styles.header}>
        <h1>{post.title}</h1>
        <ThemeToggle />
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
