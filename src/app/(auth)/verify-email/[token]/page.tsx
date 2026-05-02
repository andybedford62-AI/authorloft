import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function VerifyEmailTokenPage({ params }: Props) {
  const { token } = await params;

  if (!token) redirect("/verify-email/invalid");

  const author = await prisma.author.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpiry: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!author) redirect("/verify-email/invalid");

  try {
    await prisma.author.update({
      where: { id: author.id },
      data: {
        emailVerified: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  } catch {
    redirect("/verify-email/invalid");
  }

  redirect("/verify-email/success");
}
