"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
          background: "#0a0a0a",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#888", marginBottom: "2rem", maxWidth: "24rem" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.875rem 2rem",
            background: "#fff",
            color: "#000",
            fontWeight: 900,
            borderRadius: "1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
