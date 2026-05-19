import { useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import Controls from "../components/Controls";
import ParticipantList from "../components/ParticipantList";
import Chat from "../components/Chat";

const ROLE_COLORS = {
  host: "var(--color-host)",
  moderator: "var(--color-mod)",
  participant: "var(--color-participant)",
};

export default function RoomPage({
  roomId, me, participants, videoState, error, canControl, isHost,
  messages, onSend,
  onPlay, onPause, onSeek, onChangeVideo,
  onAssignRole, onRemove, onTransferHost, onLeave,
}) {
  const [sidebarTab, setSidebarTab] = useState("chat");

  function copyCode() {
    navigator.clipboard.writeText(roomId);
  }

  const hasVideo = !!videoState?.videoId;

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}>
            WATCHPARTY
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1 rounded"
            style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", cursor: "pointer", color: "var(--color-text)" }}
            title="Click to copy room code"
          >
            <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ROOM</span>
            <span className="text-sm font-medium tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{roomId}</span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>⎘</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>{me?.username}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ fontFamily: "var(--font-mono)", color: ROLE_COLORS[me?.role], background: ROLE_COLORS[me?.role] + "1a", fontSize: "0.65rem", letterSpacing: "0.05em" }}
            >
              {me?.role?.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onLeave}
            className="px-3 py-1.5 rounded text-xs"
            style={{ background: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-border)", cursor: "pointer", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-muted)"; }}
          >
            Leave
          </button>
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div
          className="fixed top-4 right-4 px-4 py-3 rounded text-sm z-50"
          style={{ background: "#c1121f", color: "#fff", fontFamily: "var(--font-body)", boxShadow: "0 4px 20px #c1121f55" }}
        >
          {error}
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Video + controls */}
        <div className="flex flex-col flex-1 min-w-0" style={{ background: "#000" }}>

          {/* Video area — fills all space, empty state overlaid on black */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Player always mounted so YT API initialises */}
            <div className={`w-full h-full ${hasVideo ? "block" : "hidden"}`}>
              <VideoPlayer
                videoState={videoState}
                canControl={canControl}
                onPlay={onPlay}
                onPause={onPause}
                onSeek={onSeek}
              />
            </div>

            {/* Empty state — sits on top of the black bg, no ugly box */}
            {!hasVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span style={{ fontSize: "2.5rem" }}>🎬</span>
                <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
                  {canControl ? "Paste a YouTube URL below to get started" : "Waiting for host to load a video..."}
                </p>
              </div>
            )}
          </div>

          {/* Controls always at bottom */}
          <Controls
            videoState={videoState}
            canControl={canControl}
            onPlay={onPlay}
            onPause={onPause}
            onSeek={onSeek}
            onChangeVideo={onChangeVideo}
          />
        </div>

        {/* Sidebar */}
        <div
          className="w-72 shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Tabs */}
          <div className="flex shrink-0" style={{ borderBottom: "1px solid var(--color-border)", padding: "6px", gap: "4px" }}>
            {[
              { key: "chat", label: "Chat" },
              { key: "people", label: `People (${participants.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSidebarTab(tab.key)}
                className="flex-1 py-1.5 text-xs rounded transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: sidebarTab === tab.key ? "var(--color-accent)" : "transparent",
                  color: sidebarTab === tab.key ? "#fff" : "var(--color-muted)",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {sidebarTab === "chat"
              ? <Chat messages={messages} me={me} onSend={onSend} />
              : <ParticipantList participants={participants} me={me} isHost={isHost} onAssignRole={onAssignRole} onRemove={onRemove} onTransferHost={onTransferHost} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
