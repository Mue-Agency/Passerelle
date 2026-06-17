import { request } from "./_http";

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
  proposeOuting(groupId: string, input: ProposeOutingInput) {
    return request<Record<string, unknown>>(`/api/outings/${groupId}/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  getOuting(outingId: string) {
    return request<OutingOut>(`/api/outings/${outingId}`);
  },

  joinOuting(outingId: string) {
    return request<{ participantCount: number }>(`/api/outings/${outingId}/join`, {
      method: "POST",
    });
  },

  leaveOuting(outingId: string) {
    return request<{ participantCount: number }>(`/api/outings/${outingId}/join`, {
      method: "DELETE",
    });
  },

  refuseOuting(outingId: string) {
    return request<{ acceptedCount: number; refusedCount: number }>(`/api/outings/${outingId}/refuse`, {
      method: "POST",
    });
  },

  updateOuting(outingId: string, input: ProposeOutingInput) {
    return request<Record<string, unknown>>(`/api/outings/${outingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
};
