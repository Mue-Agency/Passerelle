import { handleResponse } from "./_http";

type ConfigOut = { lieu: string; groupId: string };

export const configService = {
  async getConfig() {
    const res = await fetch("/api/config");
    return handleResponse<ConfigOut>(res);
  },
};
