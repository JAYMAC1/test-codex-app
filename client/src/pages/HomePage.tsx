import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PostCard } from "../components/PostCard";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { FilterPills } from "../components/FilterPills";
import { Skeleton } from "../components/Skeleton";

const categories = [
  { label: "All", value: "" },
  { label: "For sale", value: "FOR_SALE" },
  { label: "Free", value: "FREE" },
  { label: "Services", value: "SERVICES" },
  { label: "Lost & found", value: "LOST_FOUND" },
  { label: "Announcements", value: "ANNOUNCEMENT" },
  { label: "Events", value: "EVENT" },
];

export function HomePage() {
  const [scope, setScope] = useState("street");
  const [category, setCategory] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", scope, category],
    queryFn: async () => {
      const response = await api.get("/posts", { params: { scope, category: category || undefined } });
      return response.data.posts ?? [];
    },
  });

  return (
    <div>
      <SegmentedTabs
        tabs={[
          { label: "Street", value: "street" },
          { label: "Town", value: "town" },
        ]}
        active={scope}
        onChange={setScope}
      />

      <FilterPills options={categories} active={category} onChange={setCategory} />

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Nothing here yet. Be the first to post for your neighbours!</p>
      )}

      <div>
        {data?.map((post: any) => (
          <PostCard
            key={post._id}
            authorName={post.authorName ?? "Neighbour"}
            category={post.category}
            title={post.title}
            body={post.body}
            createdAt={post.createdAt}
            visibility={post.visibility}
            images={post.images}
          />
        ))}
      </div>
    </div>
  );
}
