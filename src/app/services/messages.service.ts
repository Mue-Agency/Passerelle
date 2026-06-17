import { request } from "./_http";

type MessageOut = {
  id: string;
  type: "TEXT" | "OUTING" | "JOIN";
  content: string | null;
  sentAt: string;
  user: { id: string; firstName: string; lastName: string };
  outing: {
    id: string;
    title: string;
    date: string;
    location: string;
    maxSpots: number;
    participantCount: number;
    participantCountrefused: number;
    isParticipant: boolean;
  } | null;
};

export type { MessageOut };

export const messagesService = {
  getMessages(groupId: string) {
    return request<MessageOut[]>(`/api/messages/${groupId}`);
  },

  sendMessage(groupId: string, content: string) {
    return request<MessageOut>(`/api/messages/${groupId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  },
};
