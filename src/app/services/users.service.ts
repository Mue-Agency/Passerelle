import type { CreateProfileDtoIn, CreateProfileDtoOut } from "@/backend/usecases_dto/users";
import { handleResponse } from "./_http";

export const usersService = {
  async createProfile(input: CreateProfileDtoIn) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleResponse<CreateProfileDtoOut>(res);
  },
};
