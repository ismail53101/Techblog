import { getAllCategories } from "@/lib/posts";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const categories = await getAllCategories();
  return <PostForm mode="create" categories={categories.map((c) => ({ id: c.id, name: c.name }))} />;
}
