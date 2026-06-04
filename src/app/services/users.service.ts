import { apiUrl, handleResponse } from "./_http";

type CreateProfileInput = {
  firstName: string;
  lastName: string;
  groupId: string;
};

type CreateProfileResult = {
  userId: string;
  groupId: string;
  token: string;
};

export const usersService = {
  async createProfile(input: CreateProfileInput) {
    const res = await fetch(apiUrl("/api/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<CreateProfileResult>(res);
  },
};
