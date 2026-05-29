"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SortiePage() {
  const router = useRouter();
  
  // États pour récupérer les valeurs du formulaire
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [lieu, setLieu] = useState("");
  
  // Gestion de l'erreur globale de saisie
  const [error, setError] = useState<string | null>(null);

  // Fonction pour envoyer la sortie
  const handleProposerSortie = () => {
    setError(null);

    // Exemple de validation avec setError
    if (!titre.trim()) {
      setError("Le titre de la sortie est obligatoire.");
      return;
    }

    // Construire les paramètres pour l'URL
    const params = new URLSearchParams({
      type: "sortie",
      titre: titre.trim(),
      date: date.trim() || "Non définie",
      heure: heure.trim() || "Non définie",
      lieu: lieu.trim() || "Non défini",
    });

    // Redirection vers le fil de discussion exact
    router.push(`/front/discu?${params.toString()}`);
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#FAF9F5] font-sans dark:bg-black">
      <main className="w-full max-w-md min-h-screen flex flex-col p-6 gap-6">

        {/* 1. EN-TÊTE DU GROUPE */}
        <div className="w-full text-center border-b border-zinc-200/60 dark:border-zinc-800 p-6 pb-4 bg-[#FAF9F5] dark:bg-black">
          <h1 className="text-xl font-bold text-[#001A0E] dark:text-zinc-50 leading-7">
            Nom de groupe 
          </h1>
        </div>

        <div className="w-full flex flex-col gap-4 mt-6">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">Proposer une sortie</p>
        </div>

        <div className="flex flex-col gap-3">

          <h2 className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
            Suggestion
          </h2>

          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-3">

            {/* LEFT */}
            <div className="flex items-center gap-3">

              {/* ICON BOX */}
              <div className="w-12 h-12 rounded-xl bg-lime-300 flex items-center justify-center">
                <span className="text-xl">☕</span>
              </div>

              {/* TEXT */}
              <div className="flex flex-col">
                <p className="font-semibold text-[#001A0E] dark:text-zinc-100">
                  Café Malo
                </p>

                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 2v3M17 2v3M3.5 9h17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Mardi prochain 15h
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setTitre("Café au Café Malo");
                setLieu("Café Malo");
                setError(null);
              }}
              className="w-10 h-10 rounded-full bg-[#426200] text-white flex items-center justify-center text-lg active:scale-95 transition"
            >
              +
            </button>

          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
            Titre de la sortie
          </label>

          <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3">
            <span className="text-zinc-400">A</span>
            <input
              type="text"
              value={titre}
              onChange={(e) => {
                setTitre(e.target.value);
                if(error) setError(null);
              }}
              placeholder="Ex: Promenade au parc"
              className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
            />
          </div>
        </div>


        <div className="grid grid-cols-2 gap-3">

          {/* DATE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
              Date
            </label>

            <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 2v3M17 2v3M3.5 9h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
              </svg>

              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
              Heure
            </label>

            <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>

              <input
                type="text"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                placeholder="HH:MM"
                className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
            Lieu
          </label>
          <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>

            <input
              type="text"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              placeholder="Saisir une adresse"
              className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
            />
          </div>
        </div>

        {/* AFFICHAGE DE L'ERREUR */}
        {error && (
          <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
            ⚠️ {error}
          </div>
        )}

        {/* 2. BOUTON DE VALIDATION ET D'ENVOI */}
        <button
          onClick={handleProposerSortie}
          className="w-full mt-auto bg-[#426200] hover:bg-[#334b00] text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition active:scale-[0.99] text-sm cursor-pointer text-center"
        >
          Proposer la sortie au groupe
        </button>

      </main>
    </div>
  );
}