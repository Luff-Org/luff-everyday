import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-error" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">Not authorized</h1>
      <p className="text-sub-text max-w-sm mb-8">
        You don&apos;t have access to this page. Sign in with an authorized
        account to continue.
      </p>
      <Link
        href="/login"
        className="px-8 py-3.5 bg-primary text-background font-black rounded-2xl hover:scale-105 transition-transform"
      >
        Go to login
      </Link>
    </div>
  );
}
