import { request } from "./_http";

type GroupOut = { id: string; name: string; lieu: string };
type MemberOut = { id: string; firstName: string; lastName: string; avatarUrl: string | null; createdAt?: string; interests?: string[] };

type GroupMembersOut = { members: MemberOut[] };

export type OutingItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  isParticipant: boolean;
};

type GroupOutingsOut = { outings: OutingItem[] };

export const groupsService = {
  getGroup(groupId: string) {
    return request<GroupOut>(`/api/groups/${groupId}`);
  },

  getGroupMembers(groupId: string) {
    return request<GroupMembersOut>(`/api/groups/${groupId}/members`);
  },

  getGroupOutings(groupId: string) {
    return request<GroupOutingsOut>(`/api/groups/${groupId}/outings`);
  },
};
