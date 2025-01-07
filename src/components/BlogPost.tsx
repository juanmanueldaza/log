import { useParams, Link } from "react-router-dom";
import { getAllPosts } from "../utils/markdown";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "./ThemeToggle";
import styles from "../styles/BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams();
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main>
        <h1>404 - Post Not Found</h1>
        <p>
          <Link to="/">&lt;&lt; Back to Home</Link>
        </p>
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
        <time dateTime={post.date} className="post-meta">
          Posted on: {post.date}
        </time>
        <div className={styles.content}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        <footer>
          <hr />
          <nav>
            <p>
              <Link to="/">&lt;&lt; Back to Home</Link>
            </p>
          </nav>
        </footer>
      </article>
    </main>
  );
}
