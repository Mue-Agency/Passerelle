import type { GetGroupDtoOut } from "@/backend/usecases_dto/groups";
import { handleResponse } from "./_http";

export const groupsService = {
  async getGroup(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}`);
    return handleResponse<GetGroupDtoOut>(res);
  },
};
