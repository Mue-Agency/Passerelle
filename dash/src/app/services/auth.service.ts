import { apiUrl, handleResponse } from "./_http";

type LoginInput = {
  firstName: string;
  password: string;
};

type RegisterAdminInput = {
  firstName: string;
  lastName: string;
  password: string;
  secret: string;
};

type AuthResult = {
  userId: string;
  username: string;
  role: string;
  token: string;
};

export const authService = {
  async login(input: LoginInput) {
    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<AuthResult>(res);
  },

  async registerAdmin(input: RegisterAdminInput) {
    const res = await fetch(apiUrl("/api/auth/register-admin"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<AuthResult>(res);
  },
};
