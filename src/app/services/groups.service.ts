import { apiUrl, authHeaders, handleResponse } from "./_http";

type GroupOut = { id: string; name: string };
type MemberOut = { id: string; firstName: string; lastName: string };

type GroupMembersOut = { members: MemberOut[] };

export const groupsService = {
  async getGroup(groupId: string) {
    const res = await fetch(apiUrl(`/api/groups/${groupId}`), {
      headers: authHeaders(),
    });
    return handleResponse<GroupOut>(res);
  },

  async getGroupMembers(groupId: string) {
    const res = await fetch(apiUrl(`/api/groups/${groupId}/members`), {
      headers: authHeaders(),
    });
    return handleResponse<GroupMembersOut>(res);
  },
};
