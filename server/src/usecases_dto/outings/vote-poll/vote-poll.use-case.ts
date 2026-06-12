import { prisma } from "../../../lib/prisma";
import type { VotePollDtoIn, VotePollDtoOut } from "./vote-poll.dto";

export async function votePoll(dto: VotePollDtoIn): Promise<VotePollDtoOut> {
  const option = await prisma.outingPollOption.findUnique({
    where: { id: dto.optionId },
    include: { outing: true },
  });
  if (!option) throw new Error("OPTION_NOT_FOUND");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: dto.userId, groupId: option.outing.groupId } },
  });
  if (!member) throw new Error("NOT_MEMBER");

  const existing = await prisma.outingPollVote.findUnique({
    where: { optionId_userId: { optionId: dto.optionId, userId: dto.userId } },
  });
  if (existing) throw new Error("ALREADY_VOTED");

  await prisma.outingPollVote.create({
    data: { optionId: dto.optionId, userId: dto.userId },
  });

  const voteCount = await prisma.outingPollVote.count({
    where: { optionId: dto.optionId },
  });

  return { optionId: dto.optionId, voteCount };
}