import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { format } from "date-fns";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/REPO_NAME/", // Add this line
  plugins: [
    react(),
    {
      name: "virtual-posts",
      resolveId(id) {
        if (id === "virtual:posts") {
          return "\0virtual:posts";
        }
      },
      load(id) {
        if (id === "\0virtual:posts") {
          const postsDirectory = path.join(__dirname, "src/content");
          const posts = fs
            .readdirSync(postsDirectory)
            .filter((file) => file.endsWith(".md"))
            .map((file) => {
              const fullPath = path.join(postsDirectory, file);
              const fileContents = fs.readFileSync(fullPath, "utf8");
              const { data, content } = matter(fileContents);

              return {
                slug: file.replace(".md", ""),
                title: data.title,
                date: format(new Date(data.date), "MMMM dd, yyyy"),
                description: data.description,
                content: content,
              };
            })
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

          return `export default ${JSON.stringify(posts)}`;
        }
      },
    },
  ],
});
