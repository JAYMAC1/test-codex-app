import clsx from "clsx";

export interface PostCardProps {
  authorName: string;
  category: string;
  title: string;
  body: string;
  createdAt: string;
  visibility: "STREET" | "STREET_AND_TOWN";
  images?: string[];
  onComment?: () => void;
  onMessage?: () => void;
}

const categoryColours: Record<string, string> = {
  FOR_SALE: "bg-orange-100 text-orange-700",
  FREE: "bg-lime-100 text-lime-700",
  SERVICES: "bg-sky-100 text-sky-700",
  LOST_FOUND: "bg-rose-100 text-rose-700",
  ANNOUNCEMENT: "bg-indigo-100 text-indigo-700",
  EVENT: "bg-emerald-100 text-emerald-700",
};

export function PostCard({
  authorName,
  category,
  title,
  body,
  createdAt,
  visibility,
  images = [],
  onComment,
  onMessage,
}: PostCardProps) {
  return (
    <article className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{authorName}</p>
          <p className="text-xs text-slate-500">{new Date(createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={clsx("rounded-full px-2 py-1 text-xs font-medium", categoryColours[category] ?? "bg-slate-100 text-slate-600")}>{category.replace("_", " ")}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            {visibility === "STREET" ? "Street" : "Street + Town"}
          </span>
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.map((url) => (
            <img key={url} src={url} alt="Post visual" className="aspect-video w-full rounded-lg object-cover" />
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-primary-dark">
        <button className="rounded-full bg-primary/10 px-3 py-1" onClick={onComment}>
          Comment
        </button>
        <button className="rounded-full bg-primary/10 px-3 py-1" onClick={onMessage}>
          Message
        </button>
      </div>
    </article>
  );
}
