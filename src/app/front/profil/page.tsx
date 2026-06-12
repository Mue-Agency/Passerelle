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
    const [showInterestInput, setShowInterestInput] = useState(false);
    const [interestInput, setInterestInput] = useState("");
    const [interests, setInterests] = useState<string[]>([]);

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

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAF9F5] font-sans dark:bg-black">
            <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

                {/* HAUT DE PAGE */}
                <div className="w-full text-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-[#152646] dark:text-zinc-50"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
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

                    <div className="flex h-16 w-16 items-center justify-center">
                        <p> 
                            {/* Membre depuis {outing.date} */}
                        </p>
                    </div>

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
                                Centres d'intérêts
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">

                <div className="flex flex-wrap items-center gap-2 mt-2">

                {/* bulles */}
                {interests.map((item, index) => (
                    <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF3FB] dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200"
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
                className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm"
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
                <div className="w-full flex mt-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 18C6.7 18 4.69583 17.2375 2.9875 15.7125C1.27917 14.1875 0.3 12.2833 0.05 10H2.1C2.33333 11.7333 3.10417 13.1667 4.4125 14.3C5.72083 15.4333 7.25 16 9 16C10.95 16 12.6042 15.3208 13.9625 13.9625C15.3208 12.6042 16 10.95 16 9C16 7.05 15.3208 5.39583 13.9625 4.0375C12.6042 2.67917 10.95 2 9 2C7.85 2 6.775 2.26667 5.775 2.8C4.775 3.33333 3.93333 4.06667 3.25 5H6V7H0V1H2V3.35C2.85 2.28333 3.8875 1.45833 5.1125 0.875C6.3375 0.291667 7.63333 0 9 0C10.25 0 11.4208 0.2375 12.5125 0.7125C13.6042 1.1875 14.5542 1.82917 15.3625 2.6375C16.1708 3.44583 16.8125 4.39583 17.2875 5.4875C17.7625 6.57917 18 7.75 18 9C18 10.25 17.7625 11.4208 17.2875 12.5125C16.8125 13.6042 16.1708 14.5542 15.3625 15.3625C14.5542 16.1708 13.6042 16.8125 12.5125 17.2875C11.4208 17.7625 10.25 18 9 18ZM11.8 13.2L8 9.4V4H10V8.6L13.2 11.8L11.8 13.2Z" fill="#45483A"/>
                    </svg>
                    <p> Historique de mon activité</p>


                </div>

        </div>

                

            </main>
        </div>
    );
}