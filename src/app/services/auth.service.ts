import { request } from "./_http";

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
  firstName: string;
  role: "CITOYEN" | "ADMIN";
  groupId?: string;
};

export const authService = {
  register(input: RegisterInput) {
    return request<AuthResult>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  login(input: LoginInput) {
    return request<AuthResult>("/api/auth/login?app=front", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
};
