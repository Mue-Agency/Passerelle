"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MessageOut } from "@/backend/usecases_dto/messages";
import { messagesService } from "@/app/services/messages.service";

const POLL_INTERVAL = 3000;

export function useMessages(groupId: string | null) {
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (gId: string) => {
    const result = await messagesService.getMessages(gId);
    if (result.isOk) {
      setMessages(result.data);
      if (result.data.length > 0) {
        latestIdRef.current = result.data[result.data.length - 1].id;
      }
    }
    return result;
  }, []);

  useEffect(() => {
    if (!groupId) return;

    let active = true;

    fetchMessages(groupId).then(() => {
      if (active) setIsLoading(false);
    });

    const interval = setInterval(() => {
      if (active) fetchMessages(groupId);
    }, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [groupId, fetchMessages]);

  return { messages, isLoading };
}
