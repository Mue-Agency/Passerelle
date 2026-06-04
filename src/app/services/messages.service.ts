import { apiUrl, authHeaders, handleResponse } from "./_http";

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
    isParticipant: boolean;
  } | null;
};

export type { MessageOut };

export const messagesService = {
  async getMessages(groupId: string) {
    const res = await fetch(apiUrl(`/api/messages/${groupId}`), {
      headers: authHeaders(),
    });
    return handleResponse<MessageOut[]>(res);
  },

  async sendMessage(groupId: string, content: string) {
    const res = await fetch(apiUrl(`/api/messages/${groupId}`), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ content }),
    });
    return handleResponse<MessageOut>(res);
  },
};
