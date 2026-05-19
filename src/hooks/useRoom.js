import { useEffect, useRef, useState, useCallback } from "react";

export function useRoom(socket) {
  const [roomId, setRoomId] = useState(null);
  const [me, setMe] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [videoState, setVideoState] = useState(null);
  const [error, setError] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [messages, setMessages] = useState([]); // chat messages

  // Clear error after 4s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room_created", ({ roomId, participant, videoState, participants }) => {
      setRoomId(roomId);
      setMe(participant);
      setVideoState(videoState);
      setParticipants(participants);
      setRemoved(false);
      setMessages([]);
    });

    socket.on("room_joined", ({ roomId, participant, videoState, participants }) => {
      setRoomId(roomId);
      setMe(participant);
      setVideoState(videoState);
      setParticipants(participants);
      setRemoved(false);
      setMessages([]);
    });

    socket.on("user_joined", ({ username, participants }) => {
      setParticipants(participants);
      // System message
      setMessages((prev) => [
        ...prev,
        { type: "system", text: `${username} joined`, timestamp: Date.now(), id: Math.random() },
      ]);
    });

    socket.on("user_left", ({ username, participants }) => {
      setParticipants(participants);
      setMessages((prev) => [
        ...prev,
        { type: "system", text: `${username} left`, timestamp: Date.now(), id: Math.random() },
      ]);
    });

    socket.on("sync_state", (state) => {
      setVideoState(state);
    });

    socket.on("role_assigned", ({ userId, username, role, participants }) => {
      setParticipants(participants);
      setMe((prev) => {
        if (prev?.userId === userId) return { ...prev, role };
        return prev;
      });
      setMessages((prev) => [
        ...prev,
        { type: "system", text: `${username} is now ${role}`, timestamp: Date.now(), id: Math.random() },
      ]);
    });

    socket.on("participant_removed", ({ participants }) => {
      setParticipants(participants);
    });

    socket.on("you_were_removed", () => {
      setRemoved(true);
      setRoomId(null);
      setMe(null);
      setParticipants([]);
      setMessages([]);
    });

    socket.on("host_transferred", ({ newHostId, newHostUsername, participants }) => {
      setParticipants(participants);
      setMe((prev) => {
        if (!prev) return prev;
        if (prev.userId === newHostId) return { ...prev, role: "host" };
        if (prev.role === "host") return { ...prev, role: "participant" };
        return prev;
      });
      setMessages((prev) => [
        ...prev,
        { type: "system", text: `${newHostUsername} is now the host`, timestamp: Date.now(), id: Math.random() },
      ]);
    });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, { ...msg, type: "chat", id: Math.random() }]);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("sync_state");
      socket.off("role_assigned");
      socket.off("participant_removed");
      socket.off("you_were_removed");
      socket.off("host_transferred");
      socket.off("chat_message");
      socket.off("error");
    };
  }, [socket]);

  // Actions
  const createRoom = useCallback((username) => {
    socket?.emit("create_room", { username });
  }, [socket]);

  const joinRoom = useCallback((roomId, username) => {
    socket?.emit("join_room", { roomId, username });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket?.emit("leave_room");
    setRoomId(null);
    setMe(null);
    setParticipants([]);
    setVideoState(null);
    setMessages([]);
  }, [socket]);

  const play = useCallback(() => socket?.emit("play"), [socket]);
  const pause = useCallback(() => {
    const t = window._ytPlayer?.getCurrentTime?.() ?? 0;
    socket?.emit("pause", { currentTime: t });
  }, [socket]);
  const seek = useCallback((time) => socket?.emit("seek", { time }), [socket]);
  const changeVideo = useCallback((videoId) => socket?.emit("change_video", { videoId }), [socket]);
  const assignRole = useCallback((userId, role) => socket?.emit("assign_role", { userId, role }), [socket]);
  const removeParticipant = useCallback((userId) => socket?.emit("remove_participant", { userId }), [socket]);
  const transferHost = useCallback((userId) => socket?.emit("transfer_host", { userId }), [socket]);
  const sendMessage = useCallback((text) => socket?.emit("chat_message", { text }), [socket]);

  const canControl = me?.role === "host" || me?.role === "moderator";
  const isHost = me?.role === "host";

  return {
    roomId, me, participants, videoState, error, removed, messages,
    canControl, isHost,
    createRoom, joinRoom, leaveRoom,
    play, pause, seek, changeVideo,
    assignRole, removeParticipant, transferHost,
    sendMessage,
  };
}
