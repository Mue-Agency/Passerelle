import { apiUrl, authHeaders, handleResponse } from "./_http";

type ProposeOutingInput = {
  title: string;
  date: string;
  location: string;
  maxSpots: number;
};

type OutingOut = {
  id: string;
  title: string;
  date: string;
  location: string;
  maxSpots: number;
  participantCount: number;
  spotsLeft: number;
  isParticipant: boolean;
  createdBy: { id: string; firstName: string; lastName: string };
  participants: { id: string; firstName: string; lastName: string }[];
};

export const outingsService = {
  async proposeOuting(groupId: string, input: ProposeOutingInput) {
    const res = await fetch(apiUrl(`/api/outings/${groupId}/propose`), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(input),
    });
    return handleResponse<Record<string, unknown>>(res);
  },

  async getOuting(outingId: string) {
    const res = await fetch(apiUrl(`/api/outings/${outingId}`), {
      headers: authHeaders(),
    });
    return handleResponse<OutingOut>(res);
  },

  async joinOuting(outingId: string) {
    const res = await fetch(apiUrl(`/api/outings/${outingId}/join`), {
      method: "POST",
      headers: authHeaders(),
    });
    return handleResponse<{ participantCount: number }>(res);
  },

  async leaveOuting(outingId: string) {
    const res = await fetch(apiUrl(`/api/outings/${outingId}/join`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse<{ participantCount: number }>(res);
  },

  async updateOuting(outingId: string, input: ProposeOutingInput) {
    const res = await fetch(apiUrl(`/api/outings/${outingId}`), {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(input),
    });
    return handleResponse<Record<string, unknown>>(res);
  },
};
