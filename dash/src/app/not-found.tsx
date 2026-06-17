import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans px-6 text-center gap-4">
      <h1 className="text-2xl font-semibold text-[#001A0E]">Page introuvable</h1>
      <p className="text-sm text-[#424843] max-w-sm">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#152646] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
