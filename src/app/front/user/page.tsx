"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usersService, type MemberProfile } from "@/app/services/users.service";
import { useAuth } from "@/app/hooks/useAuth";

function UserContent() {
    const router = useRouter();
    const { isReady } = useAuth();
    const searchParams = useSearchParams();
    const memberId = searchParams.get("id");

    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        if (!memberId) return;

        usersService.getProfile(memberId).then((profileResponse) => {
            if (profileResponse.isOk) {
                setMemberProfile(profileResponse.data);
            } else {
                setLoadError(profileResponse.error);
            }
        });
    }, [memberId]);

    if (!isReady) return null;

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans">
            <main className="flex w-full max-w-md min-h-screen flex-col items-start p-6 gap-6">

                {/* HAUT DE PAGE */}
                <div className="w-full flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-[#152646]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#152646"/>
                        </svg>
                    </button>
                    <p className="flex-1 text-center text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px]">
                        {memberProfile ? `Profil de ${memberProfile.firstName}` : "Profil"}
                    </p>
                </div>

                {loadError && (
                    <p className="w-full text-center text-sm text-red-500">{loadError}</p>
                )}

                {/* AVATAR + NOM */}
                <div className="w-full flex flex-col items-center gap-3 mt-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#C7D7F3] overflow-hidden">
                        {memberProfile?.avatarUrl ? (
                            <img src={memberProfile.avatarUrl} alt={memberProfile.firstName} className="h-full w-full object-cover" />
                        ) : (
                            <img src="/pdp.png" alt="avatar" className="h-full w-full object-cover" />
                        )}
                    </div>
                    {memberProfile && (
                        <>
                            <p className="text-lg font-semibold text-black">
                                {memberProfile.firstName} {memberProfile.lastName}
                            </p>
                            <p className="text-sm text-zinc-500">
                                Membre depuis {new Date(memberProfile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                            </p>
                            {memberProfile.interests.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 mt-1">
                                    {memberProfile.interests.map((interest, interestIndex) => (
                                        <span key={interestIndex} className="px-3 py-1 rounded-full bg-[#EEF3FB] text-sm text-zinc-700">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ACTIVITÉ */}
                <div className="w-full flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 18C6.7 18 4.69583 17.2375 2.9875 15.7125C1.27917 14.1875 0.3 12.2833 0.05 10H2.1C2.33333 11.7333 3.10417 13.1667 4.4125 14.3C5.72083 15.4333 7.25 16 9 16C10.95 16 12.6042 15.3208 13.9625 13.9625C15.3208 12.6042 16 10.95 16 9C16 7.05 15.3208 5.39583 13.9625 4.0375C12.6042 2.67917 10.95 2 9 2C7.85 2 6.775 2.26667 5.775 2.8C4.775 3.33333 3.93333 4.06667 3.25 5H6V7H0V1H2V3.35C2.85 2.28333 3.8875 1.45833 5.1125 0.875C6.3375 0.291667 7.63333 0 9 0C10.25 0 11.4208 0.2375 12.5125 0.7125C13.6042 1.1875 14.5542 1.82917 15.3625 2.6375C16.1708 3.44583 16.8125 4.39583 17.2875 5.4875C17.7625 6.57917 18 7.75 18 9C18 10.25 17.7625 11.4208 17.2875 12.5125C16.8125 13.6042 16.1708 14.5542 15.3625 15.3625C14.5542 16.1708 13.6042 16.8125 12.5125 17.2875C11.4208 17.7625 10.25 18 9 18ZM11.8 13.2L8 9.4V4H10V8.6L13.2 11.8L11.8 13.2Z" fill="#45483A"/>
                        </svg>
                        <p className="text-sm font-medium text-zinc-700">Activité récente</p>
                    </div>

                    {memberProfile && memberProfile.activity.length === 0 ? (
                        <p className="text-sm text-zinc-400">Aucune activité récente.</p>
                    ) : (
                        <ul className="flex flex-col gap-2 w-full">
                            {memberProfile?.activity.map((activityEntry, activityIndex) => (
                                <li key={activityIndex} className="flex justify-between items-center rounded-xl bg-zinc-100 px-4 py-3">
                                    <span className="text-sm font-medium text-zinc-900">{activityEntry.label}</span>
                                    <span className="text-xs text-zinc-500">
                                        {new Date(activityEntry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </main>
        </div>
    );
}

export default function UserPage() {
    return (
        <Suspense>
            <UserContent />
        </Suspense>
    );
}
