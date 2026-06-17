import { request } from "./_http";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  interests: string[];
  createdAt?: string;
};

type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  interests?: string[];
};

export const usersService = {
  getMe() {
    return request<{ exists: boolean; user: UserProfile }>("/api/users/me");
  },

  updateProfile(input: UpdateProfileInput) {
    return request<UserProfile>("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("avatar", file);
    return request<UserProfile>("/api/users/me/avatar", {
      method: "POST",
      body: form,
    });
  },
};
