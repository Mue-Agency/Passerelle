import { request } from "./_http";

type GroupOut = { id: string; name: string; lieu: string };
type MemberOut = { id: string; firstName: string; lastName: string; avatarUrl: string | null };

type GroupMembersOut = { members: MemberOut[] };

export const groupsService = {
  getGroup(groupId: string) {
    return request<GroupOut>(`/api/groups/${groupId}`);
  },

  getGroupMembers(groupId: string) {
    return request<GroupMembersOut>(`/api/groups/${groupId}/members`);
  },
};
