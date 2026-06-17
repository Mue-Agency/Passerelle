"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans px-6 text-center gap-4">
      <h1 className="text-2xl font-semibold text-[#001A0E]">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-[#424843] max-w-sm">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#152646] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer"
      >
        Réessayer
      </button>
    </div>
  );
}
