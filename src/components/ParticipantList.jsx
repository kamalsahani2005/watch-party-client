const ROLE_COLORS = {
  host: "var(--color-host)",
  moderator: "var(--color-mod)",
  participant: "var(--color-participant)",
};

const ROLE_LABELS = {
  host: "HOST",
  moderator: "MOD",
  participant: "VIEWER",
};

export default function ParticipantList({ participants, me, isHost, onAssignRole, onRemove, onTransferHost }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="text-xs tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
        >
          PARTICIPANTS
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: "var(--color-surface-2)", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
        >
          {participants.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {participants.map((p) => (
          <ParticipantRow
            key={p.userId}
            participant={p}
            isMe={p.userId === me?.userId}
            isHost={isHost}
            onAssignRole={onAssignRole}
            onRemove={onRemove}
            onTransferHost={onTransferHost}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantRow({ participant, isMe, isHost, onAssignRole, onRemove, onTransferHost }) {
  const { userId, username, role } = participant;
  const canManage = isHost && !isMe && role !== "host";

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded group"
      style={{
        background: isMe ? "var(--color-surface-2)" : "transparent",
        border: isMe ? "1px solid var(--color-border)" : "1px solid transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isMe) e.currentTarget.style.background = "var(--color-surface-2)";
      }}
      onMouseLeave={(e) => {
        if (!isMe) e.currentTarget.style.background = "transparent";
      }}
    >

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
        >
          {username}
          {isMe && (
            <span className="ml-1 text-xs" style={{ color: "var(--color-muted)" }}>
              (you)
            </span>
          )}
        </p>
      </div>

      {/* Role badge */}
      <span
        className="text-xs px-1.5 py-0.5 rounded shrink-0"
        style={{
          fontFamily: "var(--font-mono)",
          color: ROLE_COLORS[role],
          background: ROLE_COLORS[role] + "1a",
          fontSize: "0.65rem",
          letterSpacing: "0.05em",
        }}
      >
        {ROLE_LABELS[role]}
      </span>

      {/* Host actions */}
      {canManage && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {role === "participant" && (
            <ActionBtn
              title="Promote to Moderator"
              onClick={() => onAssignRole(userId, "moderator")}
              color="var(--color-mod)"
            >
              ↑
            </ActionBtn>
          )}
          {role === "moderator" && (
            <ActionBtn
              title="Demote to Participant"
              onClick={() => onAssignRole(userId, "participant")}
              color="var(--color-host)"
            >
              ↓
            </ActionBtn>
          )}
          <ActionBtn
            title="Transfer Host"
            onClick={() => onTransferHost(userId)}
            color="var(--color-host)"
          >
            ★
          </ActionBtn>
          <ActionBtn
            title="Remove from room"
            onClick={() => onRemove(userId)}
            color="var(--color-accent)"
          >
            ✕
          </ActionBtn>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, title, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-6 h-6 rounded flex items-center justify-center text-xs transition-all"
      style={{
        background: color + "22",
        color,
        border: "1px solid " + color + "44",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = color + "44")}
      onMouseLeave={(e) => (e.currentTarget.style.background = color + "22")}
    >
      {children}
    </button>
  );
}
