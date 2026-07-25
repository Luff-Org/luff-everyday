"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LogIn, Loader2 } from "lucide-react";
import { useHasMounted } from "@/shared/lib/useHasMounted";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with username and password instead.",
  CredentialsSignin: "Invalid username or password.",
};

type Mode = "signin" | "signup";

function LoginContent() {
  const mounted = useHasMounted();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const oauthError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() =>
    oauthError
      ? OAUTH_ERROR_MESSAGES[oauthError] || "Something went wrong signing you in. Try again."
      : null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't create your account.");
          setSubmitting(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid username or password.");
        setSubmitting(false);
        return;
      }

      router.replace(callbackUrl);
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  if (!mounted || status === "loading" || status === "authenticated") {
    return <div className="w-full min-h-[60vh]" />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <LogIn className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2 text-center">
        {mode === "signin" ? "Sign in to Luff." : "Create your account"}
      </h1>
      <p className="text-sub-text max-w-sm mb-8 text-center">
        One account powers every tool here — typing stats, todos, and more.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-4 bg-background/30 backdrop-blur-md border border-sub-text/20 rounded-2xl p-6">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
            className="bg-background/40 border border-sub-text/20 rounded-xl px-4 py-2.5 text-foreground placeholder:text-sub-text/50 outline-none focus:border-primary/50 transition-colors"
          />
          {mode === "signup" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              className="bg-background/40 border border-sub-text/20 rounded-xl px-4 py-2.5 text-foreground placeholder:text-sub-text/50 outline-none focus:border-primary/50 transition-colors"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            className="bg-background/40 border border-sub-text/20 rounded-xl px-4 py-2.5 text-foreground placeholder:text-sub-text/50 outline-none focus:border-primary/50 transition-colors"
          />

          {error && (
            <p className="text-error text-xs font-bold text-left">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 px-6 py-2.5 bg-primary text-background font-black rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="text-xs font-bold text-sub-text hover:text-primary transition-colors"
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-sub-text/15" />
          <span className="text-[10px] font-black uppercase tracking-widest text-sub-text/50">
            or
          </span>
          <div className="flex-1 h-px bg-sub-text/15" />
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="px-6 py-2.5 border border-sub-text/20 text-foreground font-bold rounded-xl hover:bg-sub-text/5 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[60vh]" />}>
      <LoginContent />
    </Suspense>
  );
}
