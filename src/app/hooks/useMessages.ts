"use client";

import { useState, useEffect } from "react";
import type { MessageOut } from "@/backend/usecases_dto/messages";
import { messagesService } from "@/app/services/messages.service";

export function useMessages(groupId: string | null) {
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    messagesService.getMessages(groupId).then((result) => {
      if (result.isOk) setMessages(result.data);
      setIsLoading(false);
    });

    const source = new EventSource(`/api/groups/${groupId}/messages/stream`);

    source.onmessage = (e: MessageEvent) => {
      const message = JSON.parse(e.data as string) as MessageOut;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    return () => source.close();
  }, [groupId]);

  return { messages, isLoading };
}
