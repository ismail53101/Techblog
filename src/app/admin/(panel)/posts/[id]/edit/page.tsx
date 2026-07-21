import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/lib/posts";
import { getCurrentUser } from "@/lib/auth";
import { PostForm } from "@/components/admin/post-form";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const [post, categories, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        coverImageAlt: true,
        status: true,
        featured: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        authorId: true,
        categoryId: true,
        tags: { select: { name: true } },
      },
    }),
    getAllCategories(),
    getCurrentUser(),
  ]);

  if (!post) notFound();
  if (user?.role === "AUTHOR" && post.authorId !== user.id) notFound();

  return (
    <PostForm
      mode="edit"
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        coverImageAlt: post.coverImageAlt,
        categoryId: post.categoryId,
        tags: post.tags.map((t) => t.name),
        status: post.status,
        featured: post.featured,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      }}
    />
  );
}
