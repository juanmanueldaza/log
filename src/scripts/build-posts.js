import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";

async function buildPosts() {
  const postsDirectory = path.join(process.cwd(), "src/content");
  const outputFile = path.join(process.cwd(), "src/content/posts.json");

  const files = await fs.readdir(postsDirectory);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const fullPath = path.join(postsDirectory, file);
        const fileContents = await fs.readFile(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          slug: file.replace(".md", ""),
          title: data.title,
          date: format(new Date(data.date), "MMMM dd, yyyy"),
          description: data.description,
          content: content,
        };
      }),
  );

  // Sort posts by date
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  await fs.writeFile(outputFile, JSON.stringify(posts, null, 2));
}

buildPosts().catch(console.error);
