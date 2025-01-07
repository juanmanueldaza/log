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
          <h1>──── My 90s Blog ────</h1>
          <ThemeToggle />
        </div>
        <nav className={styles.nav}>
          <Link to="/">Home</Link> |<Link to="/about">About</Link> |
          <Link to="/guestbook">Guestbook</Link>
        </nav>
        <hr />
      </header>

      <section>
        {posts.map((post) => (
          <article key={post.slug} className={styles.article}>
            <header>
              <h2>
                <Link to={`/post/${post.slug}`}>&gt;&gt; {post.title}</Link>
              </h2>
              <time dateTime={post.date} className="post-meta">
                Posted on: {post.date}
              </time>
            </header>
            <p>{post.description}</p>
            <footer>
              <Link to={`/post/${post.slug}`}>[Read More]</Link>
            </footer>
          </article>
        ))}
      </section>

      <footer>
        <hr />
        <p>
          <small>
            © {new Date().getFullYear()} | Made with HTML5 | Best viewed with
            Netscape Navigator
          </small>
        </p>
        <p>
          <small>
            Visitors: <VisitorCounter />
          </small>
        </p>
      </footer>
    </main>
  );
}
