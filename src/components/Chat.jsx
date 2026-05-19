import { useState, useEffect, useRef } from "react";

const ROLE_COLORS = {
  host: "var(--color-host)",
  moderator: "var(--color-mod)",
  participant: "var(--color-participant)",
};

export default function Chat({ messages, me, onSend }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="text-xs tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
        >
          CHAT
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <p
            className="text-sm text-center mt-4"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
          >
            No messages yet. Say hi!
          </p>
        )}

        {messages.map((msg) =>
          msg.type === "system" ? (
            <SystemMessage key={msg.id} text={msg.text} />
          ) : (
            <ChatMessage key={msg.id} msg={msg} isMe={msg.userId === me?.userId} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 flex gap-2 p-3"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={300}
          className="flex-1 px-3 py-2 rounded text-sm outline-none"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-3 py-2 rounded text-sm font-medium transition-all"
          style={{
            background: input.trim() ? "var(--color-accent)" : "var(--color-surface-2)",
            color: input.trim() ? "#fff" : "var(--color-muted)",
            border: "none",
            cursor: input.trim() ? "pointer" : "not-allowed",
            fontFamily: "var(--font-body)",
          }}
        >
          ↑
        </button>
      </form>
    </div>
  );
}

function ChatMessage({ msg, isMe }) {
  return (
    <div className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
      {/* Name + role */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-medium"
          style={{
            color: ROLE_COLORS[msg.role] || "var(--color-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {isMe ? "you" : msg.username}
        </span>
      </div>

      {/* Bubble */}
      <div
        className="max-w-[85%] px-3 py-2 rounded-lg text-sm break-words"
        style={{
          background: isMe ? "var(--color-accent)" : "var(--color-surface-2)",
          color: isMe ? "#fff" : "var(--color-text)",
          fontFamily: "var(--font-body)",
          borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          lineHeight: "1.4",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

function SystemMessage({ text }) {
  return (
    <div className="flex justify-center">
      <span
        className="text-xs px-2 py-0.5 rounded"
        style={{
          color: "var(--color-muted)",
          background: "var(--color-surface-2)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.05em",
        }}
      >
        {text}
      </span>
    </div>
  );
}
