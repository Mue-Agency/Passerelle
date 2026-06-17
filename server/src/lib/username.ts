import type { PrismaClient } from "@prisma/client";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function generateUsername(tx: TxClient, firstName: string): Promise<string> {
  const base = slugify(firstName);
  const existing = await tx.user.findFirst({ where: { username: base } });
  if (!existing) return base;

  let suffix = 2;
  while (true) {
    const candidate = `${base}${suffix}`;
    const found = await tx.user.findFirst({ where: { username: candidate } });
    if (!found) return candidate;
    suffix++;
  }
}
