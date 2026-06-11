"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { usersService } from "@/app/services/users.service";
import { Check} from "lucide-react";

export default function ProfilPage() {
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
        router.push("/front/bienvenue");
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans dark:bg-black">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full text-center mb-8">
                    <p className="text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px] dark:text-zinc-50">
                        Mon Profil
                    </p>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-center w-full mb-auto">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C7D7F3]">
                        <Check className="h-8 w-8 text-white" />
                    </div>

                    <h1 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Photo de profil
                    </h1>


                    <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                        Ajoutez une photo pour être reconnu
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




                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="nom" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Centres d&opas;intérêts
                            </label>
                        </div>
                    </form>
                </div>
                {/* BAS DE PAGE
        <div className="w-full flex flex-col gap-4 mt-8">
          <button
            type="submit"
            form="profile-form"
            disabled={isLoading || !groupId}
            className="w-full rounded-lg border border-transparent bg-[#426200] dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white cursor-pointer hover:opacity-90 outline-none focus:ring-2 focus:ring-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Chargement..." : "Je participe"}
          </button>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Groupe modéré pour garantir la sécurité de tous.
          </p>
        </div> */}

            </main>
        </div>
    );
}