"use client";

import { useState, useEffect } from "react";
import { messagesService } from "@/app/services/messages.service";
import type { MessageOut } from "@/app/services/messages.service";
import { getSocket } from "@/app/lib/socket";

export type { MessageOut };

export function useMessages(groupId: string | null) {
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    let cancelled = false;
    messagesService.getMessages(groupId).then((result) => {
      if (cancelled) return;
      if (result.isOk) setMessages(result.data);
      setIsLoading(false);
    });

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
      cancelled = true;
      socket.off("new-message", handleNewMessage);
      socket.off("outing-updated", handleOutingUpdated);
      socket.emit("leave-group", groupId);
    };
  }, [groupId]);

  return { messages, isLoading };
}
