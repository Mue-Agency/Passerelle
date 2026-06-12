import { apiUrl, handleResponse } from "./_http";

type RegisterInput = {
  firstName: string;
  lastName: string;
  password: string;
  groupId: string;
};

type LoginInput = {
  firstName: string;
  password: string;
};

type AuthResult = {
  userId: string;
  username: string;
  role: string;
  token: string;
};

export const authService = {
  async register(input: RegisterInput) {
    const res = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<AuthResult>(res);
  },

  async login(input: LoginInput) {
    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<AuthResult>(res);
  },
};
