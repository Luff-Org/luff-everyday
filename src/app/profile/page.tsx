import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { TypingDashboard, TodoDashboard } from "@/features/profile/components/ProfileDashboard";
import { TypingStatsSkeleton, TodoStatsSkeleton } from "@/features/profile/components/ProfileSkeleton";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl mt-8 flex flex-col gap-8">
        <ProfileHeaderCard
          name={session.user.name}
          email={session.user.email}
          image={session.user.image}
        />

        {/* Independent Suspense boundaries stream sections concurrently as soon as data resolves */}
        <Suspense fallback={<TypingStatsSkeleton />}>
          <TypingDashboard userId={session.user.id} />
        </Suspense>

        <Suspense fallback={<TodoStatsSkeleton />}>
          <TodoDashboard userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
