"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { usersService } from "@/app/services/users.service";

export default function FrontPage() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    configService.getConfig().then((result) => {
      if (result.isOk) setGroupId(result.data.groupId);
      else setError("Impossible de récupérer le groupe.");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!prenom.trim() || !nom.trim()) {
      setError("Veuillez remplir les deux champs.");
      return;
    }

    if (!groupId) {
      setError("Impossible de récupérer le groupe.");
      return;
    }

    setIsLoading(true);
    const result = await usersService.createProfile({
      firstName: prenom.trim(),
      lastName: nom.trim(),
      groupId,
    });
    setIsLoading(false);

    if (!result.isOk) {
      setError(result.error);
      return;
    }

    localStorage.setItem("userId", result.data.userId);
    localStorage.setItem("token", result.data.token);
    document.cookie = `userId=${result.data.userId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    router.push("/front/discu");
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans dark:bg-black">
      <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

        {/* HAUT DE PAGE */}
        <div className="w-full text-center mb-8">
          <p className="text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px] dark:text-zinc-50">
            Passerelle
          </p>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="flex flex-col items-center gap-6 text-center w-full mb-auto">
          <h1 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Créer votre profil
          </h1>

          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
            <path d="M6 7.5C6.4125 7.5 6.76562 7.35312 7.05937 7.05937C7.35312 6.76562 7.5 6.4125 7.5 6C7.5 5.5875 7.35312 5.23438 7.05937 4.94063C6.76562 4.64688 6.4125 4.5 6 4.5C5.5875 4.5 5.23438 4.64688 4.94063 4.94063C4.64688 5.23438 4.5 5.5875 4.5 6C4.5 6.4125 4.64688 6.76562 4.94063 7.05937C5.23438 7.35312 5.5875 7.5 6 7.5ZM6 13.0125C7.525 11.6125 8.65625 10.3406 9.39375 9.19687C10.1313 8.05312 10.5 7.0375 10.5 6.15C10.5 4.7875 10.0656 3.67188 9.19687 2.80312C8.32812 1.93437 7.2625 1.5 6 1.5C4.7375 1.5 3.67188 1.93437 2.80312 2.80312C1.93437 3.67188 1.5 4.7875 1.5 6.15C1.5 7.0375 1.86875 8.05312 2.60625 9.19687C3.34375 10.3406 4.475 11.6125 6 13.0125ZM6 15C3.9875 13.2875 2.48438 11.6969 1.49063 10.2281C0.496875 8.75937 0 7.4 0 6.15C0 4.275 0.603125 2.78125 1.80938 1.66875C3.01562 0.55625 4.4125 0 6 0C7.5875 0 8.98438 0.55625 10.1906 1.66875C11.3969 2.78125 12 4.275 12 6.15C12 7.4 11.5031 8.75937 10.5094 10.2281C9.51562 11.6969 8.0125 13.2875 6 15Z" fill="#424843" />
          </svg>

          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Retrouvez les personnes que vous croisez dans ce lieu, et tissez du lien plus facilement.
          </p>

          <form id="profile-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prenom" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="ex. Marie"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-black dark:text-zinc-50 outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="nom" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex. Dupont"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-black dark:text-zinc-50 outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-400 transition"
              />
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Votre nom sert uniquement à vous identifier dans ce groupe.
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>
        </div>

        {/* BAS DE PAGE */}
        <div className="w-full flex flex-col gap-4 mt-8">
          <button
            type="submit"
            form="profile-form"
            disabled={isLoading || !groupId}
            suppressHydrationWarning
            className="w-full rounded-lg border border-transparent bg-[#426200] dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white cursor-pointer hover:opacity-90 outline-none focus:ring-2 focus:ring-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Chargement..." : "Continuer"}
          </button>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Groupe modéré pour garantir la sécurité de tous.
          </p>
        </div>

      </main>
    </div>
  );
}
