import { apiUrl, authHeaders, handleResponse } from "./_http";

type Group = {
  id: string;
  name: string;
  lieu: string;
  maxMembers: number;
  createdAt: string;
  sessionCount: number;
  totalMembers: number;
};

type CreateGroupResult = {
  id: string;
  name: string;
  lieu: string;
  maxMembers: number;
  sessionNumber: number;
  createdAt: string;
};

export const groupsService = {
  async list() {
    const res = await fetch(apiUrl("/api/groups"), {
      headers: authHeaders(),
    });
    return handleResponse<Group[]>(res);
  },

  async create(name: string, lieu: string) {
    const res = await fetch(apiUrl("/api/groups"), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ name, lieu }),
    });
    return handleResponse<CreateGroupResult>(res);
  },
};
