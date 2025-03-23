import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<{ title: string; date: string; content: string } | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const context = import.meta.glob('/content/*.md');
        const filePath = `/content/${slug}.md`;
        const moduleLoader = context[filePath];

        if (!moduleLoader) {
          throw new Error('Post not found');
        }

        const module = (await moduleLoader()) as { default: string };
        const markdownContent = module.default;
        const { data, content } = matter(markdownContent);
        setPost({ title: data.title, date: data.date, content });
      } catch (err) {
        console.error('Post not found:', err);
        navigate('/');
      }
    };

    loadPost();
  }, [slug, navigate]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="text-white mb-4 inline-block hover:underline">
        ← Volver
      </Link>
      <article className="prose prose-invert">
        <h1 className="text-4xl font-bold text-white">{post.title}</h1>
        <time className="text-gray-400 block mb-8">{post.date}</time>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
};
