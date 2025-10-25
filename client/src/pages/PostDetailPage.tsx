import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PostCard } from "../components/PostCard";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: post } = useQuery({
    queryKey: ["post", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/posts/${id}/comments`);
      return response.data.comments as Array<{ _id: string; body: string; authorId: string; createdAt: string }>;
    },
  });

  if (!post) {
    return <p className="text-sm text-slate-500">Loading post...</p>;
  }

  return (
    <div>
      <PostCard
        authorName={post.authorName ?? "Neighbour"}
        category={post.category}
        title={post.title}
        body={post.body}
        createdAt={post.createdAt}
        visibility={post.visibility}
        images={post.images}
      />

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Comments</h2>
        <div className="mt-3 space-y-4">
          {comments?.map((comment) => (
            <div key={comment._id} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm text-slate-700">{comment.body}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {comments?.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
        </div>
      </section>
    </div>
  );
}
