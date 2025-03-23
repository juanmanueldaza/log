import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import matter from 'gray-matter';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

interface ModuleContent {
  default: string;
}

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const context = import.meta.glob<ModuleContent>('/content/*.md');
      const posts: BlogPost[] = [];

      for (const path in context) {
        const moduleLoader = context[path];
        const module = await moduleLoader();
        const slug = path.replace('/content/', '').replace('.md', '');
        const { data, content } = matter(module.default);
        
        posts.push({
          slug,
          title: data.title || 'Sin título',
          date: data.date || 'Sin fecha',
          excerpt: data.excerpt || content.slice(0, 150) + '...',
          content
        });
      }

      // Ordenar posts por fecha, más recientes primero
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(posts);
    };

    loadPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Blog</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="bg-black bg-opacity-50 p-6 rounded-lg">
            <Link to={`/post/${post.slug}`} className="block hover:bg-opacity-75 transition">
              <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
              <time className="text-gray-400">{post.date}</time>
              <p className="text-gray-300 mt-2">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};
