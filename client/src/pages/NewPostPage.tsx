import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const categories = [
  "FOR_SALE",
  "FREE",
  "SERVICES",
  "LOST_FOUND",
  "ANNOUNCEMENT",
  "EVENT",
];

export function NewPostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "ANNOUNCEMENT",
    visibility: "STREET" as "STREET" | "STREET_AND_TOWN",
    images: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post("/posts", {
        title: form.title,
        body: form.body,
        category: form.category,
        visibility: form.visibility,
        images: form.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
      });
      setMessage("Post published");
      navigate(`/post/${response.data._id}`);
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? "Could not create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Share an update</h1>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-4 shadow">
        <label className="block text-sm font-medium text-slate-700">
          Title
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Body
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            rows={5}
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Visibility
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.visibility}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, visibility: e.target.value as "STREET" | "STREET_AND_TOWN" }))
            }
          >
            <option value="STREET">Street only</option>
            <option value="STREET_AND_TOWN">Street + Town</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Image URLs (comma separated)
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.images}
            onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
            placeholder="https://example.com/photo.jpg"
          />
        </label>
        <button className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
          {loading ? "Posting..." : "Publish"}
        </button>
        {message && <p className="text-sm text-primary-dark">{message}</p>}
      </form>
    </div>
  );
}
