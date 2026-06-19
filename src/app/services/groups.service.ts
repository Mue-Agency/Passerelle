import { request } from "./_http";

type GroupOut = { id: string; name: string; lieu: string; maxMembers: number };
type MemberOut = { id: string; firstName: string; lastName: string; avatarUrl: string | null; createdAt?: string; interests?: string[] };

type GroupMembersOut = { members: MemberOut[] };

export const groupsService = {
  getGroup(groupId: string) {
    return request<GroupOut>(`/api/groups/${groupId}`);
  },

  getGroupMembers(groupId: string) {
    return request<GroupMembersOut>(`/api/groups/${groupId}/members`);
  },

  joinGroup(groupId: string) {
    return request<{ groupId: string }>(`/api/groups/${groupId}/join`, {
      method: "POST",
    });
  },
};
