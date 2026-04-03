import { prisma } from "@/lib/prisma";

/**
 * Returns the garden if the user has access (owner or accepted member).
 * Returns null if not found or not authorized.
 */
export async function getGardenForUser(gardenId: string, userId: string) {
  const garden = await prisma.garden.findUnique({
    where: { id: gardenId },
    include: { members: true, beds: true },
  });

  if (!garden) return null;

  const isOwner = garden.userId === userId;
  const isMember = garden.members.some(
    (m) => m.userId === userId && m.status === "accepted"
  );

  if (!isOwner && !isMember) return null;

  return garden;
}

/**
 * Returns true if the user can write to the garden (owner or editor).
 */
export async function canWriteGarden(
  gardenId: string,
  userId: string
): Promise<boolean> {
  const garden = await prisma.garden.findUnique({
    where: { id: gardenId },
    include: { members: true },
  });

  if (!garden) return false;
  if (garden.userId === userId) return true;

  return garden.members.some(
    (m) => m.userId === userId && m.status === "accepted" && m.role === "editor"
  );
}
