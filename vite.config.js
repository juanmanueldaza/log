import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { format } from "date-fns";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    base: "/REPO_NAME/", // Add this line
    plugins: [
        react(),
        {
            name: "virtual-posts",
            resolveId: function (id) {
                if (id === "virtual:posts") {
                    return "\0virtual:posts";
                }
            },
            load: function (id) {
                if (id === "\0virtual:posts") {
                    var postsDirectory_1 = path.join(__dirname, "src/content");
                    var posts = fs
                        .readdirSync(postsDirectory_1)
                        .filter(function (file) { return file.endsWith(".md"); })
                        .map(function (file) {
                        var fullPath = path.join(postsDirectory_1, file);
                        var fileContents = fs.readFileSync(fullPath, "utf8");
                        var _a = matter(fileContents), data = _a.data, content = _a.content;
                        return {
                            slug: file.replace(".md", ""),
                            title: data.title,
                            date: format(new Date(data.date), "MMMM dd, yyyy"),
                            description: data.description,
                            content: content,
                        };
                    })
                        .sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
                    return "export default ".concat(JSON.stringify(posts));
                }
            },
        },
    ],
});
