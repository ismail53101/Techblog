import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Github, Globe, Twitter } from "lucide-react";
import { getAuthorById, getPublishedPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { Avatar } from "@/components/ui/avatar";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { EmptyState } from "@/components/blog/empty-state";

export const revalidate = 300;

type Props = { params: { slug: string }; searchParams: { page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthorById(params.slug);
  if (!author) return buildMetadata({ title: "Author not found", noIndex: true });
  return buildMetadata({
    title: author.name,
    description: author.bio || `Articles written by ${author.name}.`,
    path: `/author/${author.id}`,
  });
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const author = await getAuthorById(params.slug);
  if (!author) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ page, authorId: author.id });

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="container flex flex-col items-center gap-4 py-14 text-center">
          <Avatar src={author.avatarUrl} name={author.name} size={88} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Author</p>
            <h1 className="font-heading text-3xl font-bold">{author.name}</h1>
          </div>
          {author.bio && <p className="max-w-2xl text-muted-foreground">{author.bio}</p>}
          <div className="flex items-center gap-3 text-muted-foreground">
            {author.twitter && (
              <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-foreground">
                <Twitter className="size-5" />
              </a>
            )}
            {author.github && (
              <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
                <Github className="size-5" />
              </a>
            )}
            {author.website && (
              <a href={author.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="hover:text-foreground">
                <Globe className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container py-12">
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <EmptyState title={`${author.name} hasn't published anything yet`} />
        )}
        <Pagination page={page} totalPages={totalPages} basePath={`/author/${author.id}`} />
      </div>
    </>
  );
}
