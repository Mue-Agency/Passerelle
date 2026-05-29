import type { MessageOut } from "@/backend/usecases_dto/messages";
import { handleResponse } from "./_http";

export const messagesService = {
  async getMessages(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}/messages`);
    return handleResponse<MessageOut[]>(res);
  },

  async sendMessage(groupId: string, content: string) {
    const res = await fetch(`/api/groups/${groupId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return handleResponse<MessageOut>(res);
  },
};
