import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { ProfileDashboard } from "@/features/profile/components/ProfileDashboard";
import { ProfileSkeleton } from "@/features/profile/components/ProfileSkeleton";

export default async function ProfilePage() {
  const session = await auth();
  // Middleware guards this route; this only fires if the session expires mid-visit.
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl mt-8 flex flex-col gap-8">
        <ProfileHeaderCard name={session.user.name} email={session.user.email} />

        {/* Shell (header + skeleton) streams immediately; panels stream in when
            the DB aggregations resolve — no client session/profile round trips. */}
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileDashboard userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
