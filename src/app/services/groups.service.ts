import { apiUrl, authHeaders, handleResponse } from "./_http";

type GroupOut = { id: string; name: string };

export const groupsService = {
  async getGroup(groupId: string) {
    const res = await fetch(apiUrl(`/api/groups/${groupId}`), {
      headers: authHeaders(),
    });
    return handleResponse<GroupOut>(res);
  },
};
