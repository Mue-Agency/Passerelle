import { request, type Result } from "./_http";

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
  firstName: string;
  role: "CITOYEN" | "ADMIN";
};

export const authService = {
  login(input: LoginInput): Promise<Result<AuthResult>> {
    return request<AuthResult>("/api/auth/login?app=dash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  registerAdmin(input: RegisterAdminInput): Promise<Result<AuthResult>> {
    return request<AuthResult>("/api/auth/register-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },
};
