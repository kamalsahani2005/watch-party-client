import { SocketProvider, useSocket } from "./context/SocketContext";
import { useRoom } from "./hooks/useRoom";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";

function AppInner() {
  const { socket, connected } = useSocket();

  const {
    roomId, me, participants, videoState, error, removed, messages,
    canControl, isHost,
    createRoom, joinRoom, leaveRoom,
    play, pause, seek, changeVideo,
    assignRole, removeParticipant, transferHost,
    sendMessage,
  } = useRoom(socket);

  // Removed from room
  if (removed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">🚫</p>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
          You were removed from the room.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded text-sm"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Go back home
        </button>
      </div>
    );
  }

  // Already in a room — never show connecting screen, the room stays visible
  if (roomId && me) {
    return (
      <RoomPage
        roomId={roomId}
        me={me}
        participants={participants}
        videoState={videoState}
        error={error}
        canControl={canControl}
        isHost={isHost}
        messages={messages}
        onSend={sendMessage}
        onPlay={play}
        onPause={pause}
        onSeek={seek}
        onChangeVideo={changeVideo}
        onAssignRole={assignRole}
        onRemove={removeParticipant}
        onTransferHost={transferHost}
        onLeave={leaveRoom}
      />
    );
  }

  // Home screen — only show connecting spinner before first connect
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
          Connecting...
        </p>
      </div>
    );
  }

  return <HomePage createRoom={createRoom} joinRoom={joinRoom} error={error} />;
}

export default function App() {
  return (
    <SocketProvider>
      <AppInner />
    </SocketProvider>
  );
}
