import { prisma } from "@/shared/lib/prisma";

export const profileRepository = {
  updateUser(userId: string, data: { name: string; image: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, image: true },
    });
  },
};
