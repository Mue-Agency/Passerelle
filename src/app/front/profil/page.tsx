"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/app/services/users.service";
import { groupsService, OutingItem } from "@/app/services/groups.service";
import { useAuth } from "@/app/hooks/useAuth";
import { Camera } from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const { isReady } = useAuth();
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState("");
    const [memberSince, setMemberSince] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showInterestInput, setShowInterestInput] = useState(false);
    const [interestInput, setInterestInput] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [myOutings, setMyOutings] = useState<OutingItem[]>([]);

    useEffect(() => {
        usersService.getMe().then((result) => {
            if (result.isOk) {
                const u = result.data.user;
                setPrenom(u.firstName);
                setNom(u.lastName);
                setInterests(u.interests);
                setAvatarUrl(u.avatarUrl);
                if (u.createdAt) {
                    setMemberSince(new Date(u.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
                }
            }
        });

        const gId = localStorage.getItem("groupId");
        if (gId) {
            groupsService.getGroupOutings(gId).then((result) => {
                if (result.isOk) {
                    setMyOutings(result.data.outings.filter((o) => o.isParticipant));
                }
            });
        }
    }, []);

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError("");
        const result = await usersService.uploadAvatar(file);
        if (result.isOk) {
            setAvatarUrl(result.data.avatarUrl);
        } else {
            setAvatarError(result.error);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!prenom.trim() || !nom.trim()) {
            setError("Veuillez remplir les deux champs.");
            return;
        }

        setIsLoading(true);
        const result = await usersService.updateProfile({
            firstName: prenom.trim(),
            lastName: nom.trim(),
            interests,
        });
        setIsLoading(false);

        if (!result.isOk) {
            setError(result.error);
            return;
        }

        router.push("/front/discu");
    }

    function addInterest() {
        const value = interestInput.trim();
        if (!value) return;

        if (interests.includes(value)) return;

        setInterests([...interests, value]);
        setInterestInput("");
    }

    function removeInterest(index: number) {
        setInterests(prev => prev.filter((_, i) => i !== index));
    }

    if (!isReady) return null;

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full text-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-[#152646]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z" fill="#152646"/>
                        </svg>
                    </button>
                    <p className="text-[28px] font-['Nunito_Sans'] font-extrabold text-[#001A0E] leading-[36px] tracking-[-0.7px]">
                        Mon Profil
                    </p>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="flex flex-col items-center gap-6 text-center w-full mb-auto">

                    <h1 className="w-full text-small font-semibold leading-10 tracking-tight text-black">
                        Photo de profil
                    </h1>

                    <p className="text-base leading-7 text-zinc-600">
                        Ajoutez une photo pour être reconnu
                    </p>

                    <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#C7D7F3] overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                    <path d="M34.5 28.5C34.5 29.2956 34.1839 30.0587 33.6213 30.6213C33.0587 31.1839 32.2956 31.5 31.5 31.5H4.5C3.70435 31.5 2.94129 31.1839 2.37868 30.6213C1.81607 30.0587 1.5 29.2956 1.5 28.5V12C1.5 11.2044 1.81607 10.4413 2.37868 9.87868C2.94129 9.31607 3.70435 9 4.5 9H10.5L13.5 4.5H22.5L25.5 9H31.5C32.2956 9 33.0587 9.31607 33.6213 9.87868C34.1839 10.4413 34.5 11.2044 34.5 12V28.5Z" stroke="#152646" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18 25.5C21.3137 25.5 24 22.8137 24 19.5C24 16.1863 21.3137 13.5 18 13.5C14.6863 13.5 12 16.1863 12 19.5C12 22.8137 14.6863 25.5 18 25.5Z" stroke="#152646" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#152646] text-white shadow"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    {avatarError && (
                        <p className="text-sm text-red-500">{avatarError}</p>
                    )}

                    {(prenom || nom) && (
                        <p className="text-lg font-semibold text-black">
                            {prenom} {nom}
                        </p>
                    )}
                    <p className="text-sm text-zinc-500">
                        Membre depuis {memberSince || "—"}
                    </p>

                    <form id="profile-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="prenom" className="text-sm font-medium text-zinc-500">
                                Prénom
                            </label>
                            <input
                                id="prenom"
                                type="text"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                placeholder="ex. Marie"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-black transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="nom" className="text-sm font-medium text-zinc-500">
                                Nom
                            </label>
                            <input
                                id="nom"
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="ex. Dupont"
                                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-black transition"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20.8401 4.61012C20.3294 4.09912 19.7229 3.69376 19.0555 3.4172C18.388 3.14064 17.6726 2.99829 16.9501 2.99829C16.2276 2.99829 15.5122 3.14064 14.8448 3.4172C14.1773 3.69376 13.5709 4.09912 13.0601 4.61012L12.0001 5.67012L10.9401 4.61012C9.90843 3.57842 8.50915 2.99883 7.05012 2.99883C5.59109 2.99883 4.19181 3.57842 3.16012 4.61012C2.12843 5.64181 1.54883 7.04108 1.54883 8.50012C1.54883 9.95915 2.12843 11.3584 3.16012 12.3901L4.22012 13.4501L12.0001 21.2301L19.7801 13.4501L20.8401 12.3901C21.3511 11.8794 21.7565 11.2729 22.033 10.6055C22.3096 9.93801 22.4519 9.2226 22.4519 8.50012C22.4519 7.77763 22.3096 7.06222 22.033 6.39476C21.7565 5.7273 21.3511 5.12087 20.8401 4.61012V4.61012Z" stroke="#152646" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <label className="text-sm font-medium text-zinc-500">
                                Centres d&apos;intérêts
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">

                            <div className="flex flex-wrap items-center gap-2 mt-2">

                                {/* bulles */}
                                {interests.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF3FB] text-sm text-zinc-700"
                                    >
                                        <span>{item}</span>

                                        <button
                                            type="button"
                                            onClick={() => removeInterest(index)}
                                            className="text-zinc-500 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {/* bouton + (à droite des bulles) */}
                                <button
                                    type="button"
                                    onClick={() => setShowInterestInput(true)}
                                    className="w-10 h-6 flex items-center justify-center rounded-full bg-[#EEF3FB] text-black text-lg"
                                >
                                    +
                                </button>

                            </div>


                            {showInterestInput && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={interestInput}
                                        onChange={(e) => setInterestInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();

                                                const value = interestInput.trim();
                                                if (!value) return;

                                                setInterests([...interests, value]);
                                                setInterestInput("");
                                                setShowInterestInput(false); // on referme après ajout
                                            }
                                        }}
                                        placeholder="ex. Sport, Cuisine..."
                                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const value = interestInput.trim();
                                            if (!value) return;

                                            setInterests([...interests, value]);
                                            setInterestInput("");
                                            setShowInterestInput(false);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#152646] text-white"
                                    >
                                        ✓
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                    {/*  */}
                    <div className="w-full flex flex-col gap-3 mt-6">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M9 18C6.7 18 4.69583 17.2375 2.9875 15.7125C1.27917 14.1875 0.3 12.2833 0.05 10H2.1C2.33333 11.7333 3.10417 13.1667 4.4125 14.3C5.72083 15.4333 7.25 16 9 16C10.95 16 12.6042 15.3208 13.9625 13.9625C15.3208 12.6042 16 10.95 16 9C16 7.05 15.3208 5.39583 13.9625 4.0375C12.6042 2.67917 10.95 2 9 2C7.85 2 6.775 2.26667 5.775 2.8C4.775 3.33333 3.93333 4.06667 3.25 5H6V7H0V1H2V3.35C2.85 2.28333 3.8875 1.45833 5.1125 0.875C6.3375 0.291667 7.63333 0 9 0C10.25 0 11.4208 0.2375 12.5125 0.7125C13.6042 1.1875 14.5542 1.82917 15.3625 2.6375C16.1708 3.44583 16.8125 4.39583 17.2875 5.4875C17.7625 6.57917 18 7.75 18 9C18 10.25 17.7625 11.4208 17.2875 12.5125C16.8125 13.6042 16.1708 14.5542 15.3625 15.3625C14.5542 16.1708 13.6042 16.8125 12.5125 17.2875C11.4208 17.7625 10.25 18 9 18ZM11.8 13.2L8 9.4V4H10V8.6L13.2 11.8L11.8 13.2Z" fill="#45483A"/>
                            </svg>
                            <p className="text-sm font-medium text-zinc-500">Historique de mon activité</p>
                        </div>

                        {myOutings.length === 0 ? (
                            <p className="text-sm text-zinc-400">Aucune sortie pour le moment.</p>
                        ) : (
                            <ul className="flex flex-col gap-2 w-full">
                                {myOutings.map((o) => (
                                    <li key={o.id} className="flex justify-between items-center rounded-xl bg-zinc-100 px-4 py-3">
                                        <span className="text-sm font-medium text-zinc-900">{o.title}</span>
                                        <span className="text-xs text-zinc-500">
                                            {new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>



            </main>
        </div>
    );
}