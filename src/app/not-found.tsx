import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">Page not found</h1>
      <p className="text-sub-text max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3.5 bg-primary text-background font-black rounded-2xl hover:scale-105 transition-transform"
      >
        Back home
      </Link>
    </div>
  );
}
