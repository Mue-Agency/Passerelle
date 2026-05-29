import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const lieu            = process.env.LIEU             ?? "Lieu par défaut";
  const defaultGroupId  = process.env.DEFAULT_GROUP_ID ?? "groupe-default";

  const group = await prisma.group.upsert({
    where:  { id: defaultGroupId },
    update: { name: lieu },
    create: { id: defaultGroupId, name: lieu },
  });

  console.log(`✓ Groupe créé ou mis à jour : "${group.name}" (id: ${group.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
