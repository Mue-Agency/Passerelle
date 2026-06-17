"use client";

import { useState, useEffect } from "react";
import { groupsService } from "@/app/services/groups.service";
import { useAuth } from "@/app/hooks/useAuth";
import { User, ChevronRight } from "lucide-react";

export default function MembrePage() {
    const { isReady } = useAuth();
    const [members, setMembers] = useState<{ id: string; firstName: string; lastName: string; avatarUrl: string | null }[]>([]);

    useEffect(() => {
        const gId = localStorage.getItem("groupId");
        if (!gId) return;
        groupsService.getGroupMembers(gId).then((result) => {
            if (result.isOk) setMembers(result.data.members);
        });
    }, []);

    if (!isReady) return null;

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans dark:bg-black">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full text-center mb-8">
                    <p className="text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px] dark:text-zinc-50">
                        Groupe
                    </p>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-left w-full mb-auto">

                    <h3 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Membre du Groupe !
                    </h3>


                    <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                        Retrouvez les personnes qui partagent vos sorties au marché.
                    </p>

                </div>

                {/* <div className="flex items-center gap-3 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
        <img
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-10 w-10 rounded-full object-cover"
        />

        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {user.firstName} {user.lastName}
        </span>
        </div> */}

                {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                    {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={`${m.firstName}`} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-zinc-500" />
                    )}
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {m.firstName} {m.lastName}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
                ))}

                {/* BAS DE PAGE */}
                <div className="w-full mt-8">
                    <div className="flex flex-row items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[#E3EBF9] dark:bg-zinc-900 px-4 py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill="none">
                            <path d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#152646"/>
                        </svg>
                        <p className="text-small text-dark dark:text-zinc-500 text-center">
                            Ce groupe est limité à 4 membres pour garder une ambiance conviviale et faciliter les déplacements.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}