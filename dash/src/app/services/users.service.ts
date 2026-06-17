import { request, type Result } from "./_http";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  interests: string[];
};

export const usersService = {
  getMe(): Promise<Result<{ exists: boolean; user: UserProfile }>> {
    return request<{ exists: boolean; user: UserProfile }>("/api/users/me");
  },
};
