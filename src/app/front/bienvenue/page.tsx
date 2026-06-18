"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { groupsService } from "@/app/services/groups.service";
import { useAuth } from "@/app/hooks/useAuth";
import { ChevronRight } from "lucide-react";

type Member = { id: string; firstName: string; lastName: string; avatarUrl: string | null };

export default function BienvenuePage() {
    const router = useRouter();
    const { isReady } = useAuth();
    const [groupId] = useState<string | null>(
        () => (typeof window !== "undefined" ? localStorage.getItem("groupId") : null),
    );
    const [groupName, setGroupName] = useState("");
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (localStorage.getItem("hasSeenWelcome")) {
            router.replace("/front/discu");
            return;
        }
        if (!groupId) return;

        groupsService.getGroup(groupId).then((result) => {
            if (result.isOk) setGroupName(result.data.name);
        });

        groupsService.getGroupMembers(groupId).then((result) => {
            if (result.isOk) setMembers(result.data.members);
        });
    }, [groupId, router]);

    if (!isReady) return null;

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full flex items-center justify-center gap-3 mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none" className="shrink-0">
                        <path fillRule="evenodd" clipRule="evenodd" d="M24.2729 35.2628C27.9361 35.135 31.2574 33.7529 33.1683 32.0737C34.2537 31.1199 35.1168 30.0842 35.6512 29.1268C37.0667 26.5908 36.9705 26.1818 33.9416 26.1283C36.8412 25.3695 38.3945 23.848 39.3646 21.5723C40.299 19.3804 40.8243 16.9348 40.6453 15.4407C40.4802 14.0619 38.7057 15.038 37.9598 15.347C40.3127 13.9269 40.5494 11.5308 40.3127 9.14413C39.888 4.86363 37.5289 0 32.3454 0C29.0264 9.64554e-07 26.4352 2.30312 25.5889 4.76623C24.3044 8.50506 25.5069 10.8373 26.3715 12.5142C26.4503 12.667 26.5269 12.8156 26.5979 12.9581C26.1585 12.3554 25.8259 11.8518 25.5603 11.4496C24.9027 10.4539 24.6556 10.0798 24.214 10.3624C23.0157 11.1292 22.1865 16.304 22.6871 19.266C22.0217 17.3508 21.6766 16.4292 21.0052 16.9387C20.3313 17.45 19.1363 19.3894 18.8013 22.4748C18.5534 20.5286 18.4545 20.2452 17.8316 20.7469C16.9929 21.4224 15.4162 23.4092 14.5699 25.6836C14.5802 25.6021 14.5901 25.5231 14.5998 25.4462C14.7315 24.3974 14.8139 23.7412 15.0405 22.5522C12.8642 24.4575 11.8444 25.8965 10.6006 29.0634C10.653 27.5514 11.09 25.2965 11.9902 23.9069C10.6006 24.44 9.0449 26.1443 8.73901 28.6788C8.36601 27.6658 8.39014 27.0254 8.42577 26.0803C8.4282 26.0157 8.43069 25.9497 8.43311 25.8821C7.7514 26.9833 7.75936 29.0849 8.06526 31.0602C7.63535 29.3945 6.66766 28.303 5.68879 28.0496C6.38767 28.7707 6.94467 30.0778 7.16747 31.4889C6.98923 31.1621 6.01397 30.4343 5.36278 30.4343C5.83758 30.7392 6.50534 31.5267 6.80699 32.3524C6.36675 31.974 5.94467 31.7204 5.36278 31.7204C5.88824 31.9761 6.37122 32.5441 6.59068 33.1028C6.62763 33.1969 6.72878 33.2534 6.8263 33.2269C21.652 29.1936 31.8526 20.6836 32.7752 4.70901C34.3272 28.6732 7.6981 34.2095 5.36513 34.6945C5.32098 34.7037 5.28552 34.7111 5.25913 34.7167C5.03382 34.7673 4.78501 34.8231 4.51464 34.8942C3.52492 35.1545 2.65891 35.2508 1.95719 35.3288C0.602299 35.4795 -0.140112 35.562 0.0220073 36.6256C0.133739 37.3586 0.701864 37.6002 1.50935 37.5346C1.9905 37.4955 2.62094 37.2942 3.47112 37.0227C4.28166 36.7639 5.29202 36.4412 6.56334 36.1345C7.10044 36.0049 7.49101 35.9175 8.10276 36.381C9.19634 37.2094 9.89509 38.2068 10.487 39.2587C10.4381 38.6243 10.3892 38.2733 10.1774 37.6741C11.1432 39.0364 11.7064 39.6256 12.7638 40.2513C12.2946 39.5649 12.0845 39.1704 11.7484 38.4618C12.9232 39.4317 14.1162 39.9554 15.7555 39.9554C14.1071 39.3361 13.1873 38.2251 12.5452 37.3872C16.9276 40.4205 25.3132 39.6566 29.0029 35.6847C27.219 35.5911 25.6428 35.4852 24.2729 35.2628Z" fill="#152646"/>
                    </svg>
                    <p className="text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px]">
                        Alouette
                    </p>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-center w-full mb-auto">

                    <div className="relative h-16 w-16">
                        <div className="h-16 w-16 rounded-full bg-[#C7D7F3]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <path d="M33 16.62V18C32.9982 21.2346 31.9508 24.382 30.014 26.9727C28.0773 29.5634 25.3549 31.4587 22.253 32.3758C19.1511 33.293 15.8359 33.1828 12.8017 32.0619C9.76752 30.9409 7.17698 28.8691 5.41644 26.1556C3.6559 23.442 2.81969 20.2321 3.03252 17.0045C3.24534 13.7768 4.49581 10.7045 6.59742 8.24559C8.69903 5.78671 11.5392 4.07305 14.6943 3.3602C17.8494 2.64734 21.1504 2.97349 24.105 4.28998" stroke="#152646" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M33 6L18 21.015L13.5 16.515" stroke="#152646" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <h1 className="w-full text-3xl font-semibold leading-10 tracking-tight text-black">
                        Bienvenue !
                    </h1>

                    <p className="text-base leading-7 text-zinc-600 font-medium">
                        Vous faites maintenant partie du groupe {groupName ? `« ${groupName} »` : ""}. Vous pouvez discuter et proposer une sortie ensemble.
                    </p>

                </div>

                <div className="flex flex-col items-center gap-6 text-center w-full mb-auto">
                    <h2 className="w-full text-2xl font-bold leading-10 tracking-tight text-black">
                        Déjà membres du groupe
                    </h2>
                </div>

                <div className="flex flex-col gap-[16px] w-full">
                    {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-[20px] rounded-[12px] px-[20px] py-[8px]">
                            <img
                                src={m.avatarUrl ?? "/pdp.png"}
                                alt={`${m.firstName} ${m.lastName}`}
                                className="w-[64px] h-[64px] rounded-full object-cover shrink-0"
                            />
                            <span className="text-[20px] font-semibold text-[#1a1c1b] flex-1">
                                {m.firstName} {m.lastName}
                            </span>
                            <ChevronRight className="h-[12px] w-[7.4px] text-zinc-400 shrink-0" />
                        </div>
                    ))}
                </div>


                {/* BAS DE PAGE */}
                <div className="w-full flex flex-col gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => { localStorage.setItem("hasSeenWelcome", "true"); router.push("/front/discu"); }}
                        disabled={!groupId}
                        className="w-full rounded-lg bg-[#152646] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        Accéder au groupe
                    </button>
                    <p className="text-xs text-zinc-400 text-center font-medium">
                        Groupe modéré pour garantir la sécurité de tous.
                    </p>
                </div>

            </main>
        </div>
    );
}