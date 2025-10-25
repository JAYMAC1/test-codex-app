import clsx from "clsx";

interface StreetChatBubbleProps {
  text: string;
  mine?: boolean;
  senderName: string;
  createdAt: string;
}

export function StreetChatBubble({ text, mine = false, senderName, createdAt }: StreetChatBubbleProps) {
  return (
    <div className={clsx("mb-3 flex", mine ? "justify-end" : "justify-start")}> 
      <div className={clsx("max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow", mine ? "bg-primary text-white" : "bg-white text-slate-700")}> 
        {!mine && <p className="text-xs font-semibold text-primary-light">{senderName}</p>}
        <p className="mt-1 whitespace-pre-line">{text}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
