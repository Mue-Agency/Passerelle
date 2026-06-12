"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { usersService } from "@/app/services/users.service";
import { Check, User , ChevronRight} from "lucide-react";
import type { MessageOut } from "@/app/hooks/useMessages";

export default function MembrePage() {
    const router = useRouter();
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);

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
        router.push("/front/discu");
    }

    function AuthorName(user: MessageOut["user"]): string {
        return `${user.firstName} ${user.lastName.charAt(0)}.`;
    }


    return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans dark:bg-black">
        <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

        <div className="w-full flex items-center justify-between px-[20px] py-[12px] border-b border-[rgba(193,200,193,0.3)] bg-[#FAF9F5] dark:bg-black sticky top-0 z-10">

        <div className="flex items-center gap-[10px]">
            <button
            onClick={() => router.back()}
            className="flex items-center text-[#152646] dark:text-zinc-50"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </button>

            <h1 className="text-[18px] font-bold text-[#001A0E] dark:text-zinc-50 truncate">
            {groupName ?? "..."}
            </h1>
        </div>

        </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-left w-full mb-auto mt-8">

                    <h3 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Membre du Groupe !
                    </h3>
                    <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                        Retrouvez les personnes qui partagent vos sorties au marché.
                    </p>
                    <div className="flex flex-col gap-[12px] overflow-y-auto">
              {/* {Array.from({ length: outing.participantCount }).map((_, index) => ( */}
                <div className="flex items-center gap-[12px] p-[12px] rounded-[12px] bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src="/assets/group-placeholder.png"
                    alt="Photo de profil"
                    className="w-8 h-8 rounded-full"
                  />

                  <span>
                     {/* {user.firstName} {user.lastName} */}
                  </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" onClick={() => { router.push('/front/profil'); }} />
                </div>
              {/* ))} */}
            </div>
                </div>

                {/* BAS DE PAGE */}
               <div className="w-full mt-8 flex items-start gap-3 p-4 rounded-[12px] bg-[#E3EBF9] dark:bg-zinc-800">

                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E3EBF9]/10 dark:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#152646" />
                    </svg>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Ce groupe est limité à 4 membres pour garder une ambiance conviviale et faciliter les déplacements.
                </p>

                </div>

            </main>
        </div>
    );
}