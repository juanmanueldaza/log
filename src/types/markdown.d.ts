declare module "*.md" {
  const content: {
    attributes: Record<string, unknown>;
    html: string;
    content: string;
  };
  export default content;
}
