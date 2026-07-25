import { ProfileSkeleton } from "@/features/profile/components/ProfileSkeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl mt-8">
        <ProfileSkeleton />
      </div>
    </div>
  );
}
