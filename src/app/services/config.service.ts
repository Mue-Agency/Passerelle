import { request } from "./_http";

type ConfigOut = { lieu: string; groupId: string };

export const configService = {
  getConfig() {
    return request<ConfigOut>("/api/config");
  },
};
