import { useState } from "react";

export default function HomePage({ createRoom, joinRoom, error }) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [tab, setTab] = useState("create"); // "create" | "join"

  function handleCreate(e) {
    e.preventDefault();
    if (!username.trim()) return;
    createRoom(username.trim());
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim().toUpperCase(), username.trim());
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1
          className="text-7xl tracking-widest"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
        >
          WATCHPARTY
        </h1>
        <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)", fontSize: "0.9rem", marginTop: "0.5rem", letterSpacing: "0.15em" }}>
          WATCH TOGETHER · IN SYNC
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {/* Tabs */}
        <div className="flex mb-8 rounded" style={{ background: "var(--color-surface-2)", padding: "4px", gap: "4px" }}>
          {["create", "join"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-sm font-medium rounded transition-all"
              style={{
                fontFamily: "var(--font-body)",
                background: tab === t ? "var(--color-accent)" : "transparent",
                color: tab === t ? "#fff" : "var(--color-muted)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {t === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>

        <form onSubmit={tab === "create" ? handleCreate : handleJoin}>
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block text-xs mb-2"
                style={{ color: "var(--color-muted)", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}
              >
                YOUR NAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                required
                className="w-full px-4 py-3 rounded text-sm outline-none transition-all"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            {tab === "join" && (
              <div>
                <label
                  className="block text-xs mb-2"
                  style={{ color: "var(--color-muted)", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}
                >
                  ROOM CODE
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 rounded text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>
            )}

            {error && (
              <p
                className="text-sm px-3 py-2 rounded"
                style={{ background: "#c1121f22", color: "#ff6b6b", border: "1px solid #c1121f44", fontFamily: "var(--font-body)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded font-medium text-sm transition-all mt-2"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--color-accent-dim)")}
              onMouseLeave={(e) => (e.target.style.background = "var(--color-accent)")}
            >
              {tab === "create" ? "Create Party" : "Join Party"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
