"use client";

import { useState, useEffect, useCallback } from "react";
import { messagesService } from "@/app/services/messages.service";
import type { MessageOut } from "@/app/services/messages.service";
import { getSocket } from "@/app/lib/socket";

export type { MessageOut };

export function useMessages(groupId: string | null) {
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async (gId: string) => {
    const result = await messagesService.getMessages(gId);
    if (result.isOk) setMessages(result.data);
    return result;
  }, []);

  useEffect(() => {
    if (!groupId) return;

    fetchMessages(groupId).then(() => setIsLoading(false));

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("join-group", groupId);

    const handleNewMessage = (message: MessageOut) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const handleOutingUpdated = (updated: {
      id: string;
      title: string;
      date: string;
      location: string;
      maxSpots: number;
      participantCount: number;
    }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.outing?.id !== updated.id) return msg;
          return {
            ...msg,
            outing: { ...msg.outing, ...updated },
          };
        }),
      );
    };

    socket.on("new-message", handleNewMessage);
    socket.on("outing-updated", handleOutingUpdated);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("outing-updated", handleOutingUpdated);
      socket.emit("leave-group", groupId);
    };
  }, [groupId, fetchMessages]);

  return { messages, isLoading };
}
