import type { ProposeOutingDtoOut } from "@/backend/usecases_dto/outings";
import { handleResponse } from "./_http";

type ProposeOutingInput = {
  title: string;
  date: string;
  location: string;
  maxSpots: number;
};

export const outingsService = {
  async proposeOuting(groupId: string, input: ProposeOutingInput) {
    const res = await fetch(`/api/groups/${groupId}/outings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<ProposeOutingDtoOut>(res);
  },
};
