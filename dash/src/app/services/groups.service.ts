import { request, type Result } from "./_http";

export type Group = {
  id: string;
  name: string;
  lieu: string;
  maxMembers: number;
  createdAt: string;
  sessionCount: number;
  totalMembers: number;
};

export type CreateGroupResult = {
  id: string;
  name: string;
  lieu: string;
  maxMembers: number;
  sessionNumber: number;
  createdAt: string;
};

export const groupsService = {
  list(): Promise<Result<Group[]>> {
    return request<Group[]>("/api/groups");
  },

  create(name: string, lieu: string): Promise<Result<CreateGroupResult>> {
    return request<CreateGroupResult>("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lieu }),
    });
  },
};
