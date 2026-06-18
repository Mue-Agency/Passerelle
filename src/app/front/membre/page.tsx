"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { groupsService } from "@/app/services/groups.service";
import { useAuth } from "@/app/hooks/useAuth";
import { ChevronRight } from "lucide-react";

type GroupMember = { id: string; firstName: string; lastName: string; avatarUrl: string | null };
type GroupSummary = { name: string; lieu: string; maxMembers: number };

export default function MembrePage() {
    const router = useRouter();
    const { isReady } = useAuth();
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [group, setGroup] = useState<GroupSummary | null>(null);
    // Chargement uniquement si un groupId est présent ; sinon on affiche directement l'état vide.
    const [isLoadingMembers, setIsLoadingMembers] = useState(
        () => typeof window !== "undefined" && !!localStorage.getItem("groupId"),
    );

    useEffect(() => {
        const groupId = localStorage.getItem("groupId");
        if (!groupId) return;

        groupsService.getGroup(groupId).then((groupResponse) => {
            if (groupResponse.isOk) setGroup(groupResponse.data);
        });

        groupsService.getGroupMembers(groupId).then((membersResponse) => {
            if (membersResponse.isOk) setMembers(membersResponse.data.members);
            setIsLoadingMembers(false);
        });
    }, []);

    if (!isReady) return null;

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-[#152646]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#152646"/>
                        </svg>
                    </button>
                    <p className="flex-1 text-center text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px]">
                        {group?.name ?? "Groupe"}
                    </p>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-left w-full mb-auto">

                    <h3 className="w-full text-3xl font-bold leading-10 tracking-tight text-black">
                        Membres du Groupe !
                    </h3>

                    <p className="text-base leading-7 text-zinc-600 font-medium">
                        Retrouvez les personnes qui partagent vos sorties{group?.lieu ? ` à ${group.lieu}` : ""}.
                    </p>

                    {isLoadingMembers ? (
                        <p className="w-full text-sm text-zinc-400">Chargement des membres…</p>
                    ) : members.length === 0 ? (
                        <p className="w-full text-sm text-zinc-400">Aucun membre pour le moment.</p>
                    ) : (
                        members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => router.push(`/front/user?id=${member.id}`)}
                                className="w-full flex items-center gap-3 rounded-full  px-4 py-2"
                            >
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.firstName} className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                    <img src="/pdp.png" alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                                )}
                                <span className="flex-1 text-left text-sm font-medium text-zinc-900">
                                    {member.firstName} {member.lastName}
                                </span>
                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                            </button>
                        ))
                    )}

                </div>

                {/* BAS DE PAGE */}
                <div className="w-full mt-8">
                    <div className="flex flex-row items-start gap-3 rounded-xl border border-zinc-200 bg-[#E3EBF9] px-4 py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">
                            <g clip-path="url(#clip0_1597_670)">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#152646" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 16V12" stroke="#152646" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 8H12.01" stroke="#152646" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1597_670">
                                <rect width="24" height="24" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        <p className="text-sm text-[#001A0E] text-left font-medium">
                            Ce groupe est limité à {group?.maxMembers ?? 4} membres pour garder une ambiance conviviale et faciliter les déplacements.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
