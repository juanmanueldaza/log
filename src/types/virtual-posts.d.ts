declare module "virtual:posts" {
  import { BlogPost } from "../utils/markdown";
  const posts: BlogPost[];
  export default posts;
}
