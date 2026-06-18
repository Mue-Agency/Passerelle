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

                    <h3 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black">
                        Membre(s) du Groupe !
                    </h3>

                    <p className="text-base leading-7 text-zinc-600">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill="none">
                            <path d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z" fill="#152646"/>
                        </svg>
                        <p className="text-sm text-[#001A0E] text-center">
                            Ce groupe est limité à {group?.maxMembers ?? 4} membres pour garder une ambiance conviviale et faciliter les déplacements.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
