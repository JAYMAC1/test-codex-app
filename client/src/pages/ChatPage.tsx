import { FormEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../features/auth/AuthContext";
import { api } from "../lib/api";
import { StreetChatBubble } from "../components/StreetChatBubble";

interface StreetMessage {
  _id: string;
  streetGroupId: string;
  senderId: string;
  text: string;
  createdAt: string;
  senderName?: string;
}

let socket: Socket | null = null;

export function ChatPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<StreetMessage[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const streetGroupId = user?.streetGroupId;

  const { refetch } = useQuery({
    queryKey: ["street-chat", streetGroupId],
    enabled: Boolean(streetGroupId),
    queryFn: async () => {
      const response = await api.get(`/streets/${streetGroupId}/chat`);
      setMessages(response.data.messages);
      return response.data.messages as StreetMessage[];
    },
  });

  useEffect(() => {
    if (!streetGroupId || !token) return;

    socket = io(import.meta.env.VITE_API_BASE?.replace("/api", "") ?? "http://localhost:4000", {
      auth: { token },
    });

    socket.emit("street:join", streetGroupId);

    socket.on("street:message", (message: StreetMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [streetGroupId, token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !streetGroupId) return;

    if (socket) {
      socket.emit("street:message", { streetGroupId, text });
    }
    setText("");
    await api.post(`/streets/${streetGroupId}/chat`, { text });
    await refetch();
  };

  if (!streetGroupId) {
    return <p className="text-sm text-slate-500">Join your street to access the live chat.</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-white p-4 shadow-inner">
        {messages.map((message) => (
          <StreetChatBubble
            key={message._id}
            text={message.text}
            mine={message.senderId === user?.id}
            senderName={message.senderName ?? "Neighbour"}
            createdAt={message.createdAt}
          />
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="safe-bottom mt-4 flex items-center gap-2 rounded-full bg-white p-2 shadow">
        <input
          className="flex-1 rounded-full border border-transparent bg-slate-100 px-4 py-2 text-sm"
          placeholder="Send a message to your neighbours"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Send</button>
      </form>
    </div>
  );
}
