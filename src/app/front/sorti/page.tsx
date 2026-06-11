"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { groupsService } from "@/app/services/groups.service";
import { outingsService } from "@/app/services/outings.service";

function getNextSuggestionDate(): string {
  const now = new Date();
  const daysUntilTuesday = (2 - now.getDay() + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilTuesday);
  next.setHours(15, 0, 0, 0);
  return next.toISOString();
}

function formatSuggestionDate(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${label} prochain ${d.getHours()}h`;
}

export default function SortiePage() {
  return (
    <Suspense>
      <SortieContent />
    </Suspense>
  );
}

function SortieContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outingId = searchParams.get("outingId");

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [lieu, setLieu] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxSpots, setMaxSpots] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const isEditMode = !!outingId;
  const suggestionDate = getNextSuggestionDate();

  useEffect(() => {
    configService.getConfig().then(async (configResult) => {
      if (!configResult.isOk) return;
      setGroupId(configResult.data.groupId);
      setLieu(configResult.data.lieu);

      const groupResult = await groupsService.getGroup(configResult.data.groupId);
      if (groupResult.isOk) setGroupName(groupResult.data.name);
    });
  }, []);

  useEffect(() => {
    if (!outingId) return;
    outingsService.getOuting(outingId).then((result) => {
      if (!result.isOk) return;
      setTitle(result.data.title);
      const d = new Date(result.data.date);
      setDate(d.toISOString().split("T")[0]);
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setLocation(result.data.location);
      setMaxSpots(result.data.maxSpots);
    });
  }, [outingId]);

  function applySuggestion() {
    if (!lieu) return;
    setTitle(lieu);
    const d = new Date(suggestionDate);
    setDate(d.toISOString().split("T")[0]);
    setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setLocation(lieu);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !date || !time || !location.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isEditMode && !groupId) {
      setError("Impossible de récupérer le groupe.");
      return;
    }

    const isoDate = `${date}T${time}:00`;
    setIsLoading(true);

    if (isEditMode) {
      const result = await outingsService.updateOuting(outingId, {
        title: title.trim(),
        date: isoDate,
        location: location.trim(),
        maxSpots,
      });
      setIsLoading(false);
      if (!result.isOk) {
        setError(result.error);
        return;
      }
    } else {
      const result = await outingsService.proposeOuting(groupId!, {
        title: title.trim(),
        date: isoDate,
        location: location.trim(),
        maxSpots,
      });
      setIsLoading(false);
      if (!result.isOk) {
        setError(result.error);
        return;
      }
    }

    setShowModal(true);
  }

  const truncatedName = groupName
    ? groupName.length > 30 ? groupName.slice(0, 30) + "..." : groupName
    : "...";

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#FAF9F5] font-sans dark:bg-black">
      <main className="w-full max-w-md min-h-screen flex flex-col relative">

        {/* HEADER avec flèche retour */}
        <div className="w-full flex items-center gap-2 px-5 py-3 bg-[#FAF9F5] dark:bg-black sticky top-0 z-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-[#001A0E] dark:text-zinc-50 hover:opacity-70 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-base font-bold text-[#001A0E] dark:text-zinc-50 leading-7 truncate">
            {truncatedName}
          </span>
        </div>

        <form id="sortie-form" onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 pb-24">

          {/* TITRE */}
          <h2 className="text-xl font-bold text-[#001A0E] dark:text-zinc-50 mt-4 mb-6">
            {isEditMode ? "Modifier la sortie" : "Proposer une sortie"}
          </h2>

          {/* SECTION SUGGESTION (seulement en mode création) */}
          {!isEditMode && lieu && (
            <div className="flex flex-col gap-3 mb-8">
              <p className="text-base font-bold text-[#001A0E] dark:text-zinc-200">
                Suggestion
              </p>
              <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#E8F0D0] flex items-center justify-center flex-shrink-0">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#426200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[#001A0E] dark:text-zinc-100 truncate">
                    {lieu}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <svg width="14" height="15" viewBox="0 0 19 20" fill="none" className="flex-shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M14 17V20H16V17H19V15H16V12H14V15H11V17H14ZM0.5875 17.4125C0.979167 17.8042 1.45 18 2 18H9V16H2V8H14V10.025H16V4C16 3.45 15.8042 2.97917 15.4125 2.5875C15.0208 2.19583 14.55 2 14 2H13V0H11V2H5V0H3V2H2C1.45 2 0.979167 2.19583 0.5875 2.5875C0.195833 2.97917 0 3.45 0 4V16C0 16.55 0.195833 17.0208 0.5875 17.4125ZM14 6H2V4H14V6Z" fill="#888" />
                    </svg>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatSuggestionDate(suggestionDate)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="w-10 h-10 rounded-full bg-[#426200] text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 transition cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* FORMULAIRE */}
          <div className="flex flex-col gap-6">
            {/* Titre de la sortie */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200 pl-1">
                Titre de la sortie
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-3.5">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="flex-shrink-0">
                  <path d="M0 0h10l6 6v12H0V0z" fill="none" stroke="#999" strokeWidth="1.5" />
                  <path d="M10 0v6h6" fill="none" stroke="#999" strokeWidth="1.5" />
                </svg>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Promenade au parc"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#001A0E] dark:text-zinc-200">
                  Date
                </label>
                <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3.5">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="flex-shrink-0">
                    <path d="M5 0v3M13 0v3M0 7h18M2 2h14a2 2 0 012 2v14a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#999" strokeWidth="1.5" />
                  </svg>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#001A0E] dark:text-zinc-200 pl-1">
                  Heure
                </label>
                <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3.5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <circle cx="10" cy="10" r="9" stroke="#999" strokeWidth="1.5" />
                    <path d="M10 4v6l4 2" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Lieu */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#001A0E] dark:text-zinc-200 pl-1">
                Lieu
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-3.5">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="flex-shrink-0">
                  <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#999" strokeWidth="1.5" />
                  <path d="M8 19s6-4.5 6-11A6 6 0 002 8c0 6.5 6 11 6 11z" stroke="#999" strokeWidth="1.5" />
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Saisir une adresse"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Sondage Horaires */}
            <div className="rounded-[28px] bg-[#EEF2F8] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <path
                      d="M4 14H6V7H4V14ZM8 14H10V4H8V14ZM12 14H14V10H12V14ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2Z"
                      fill="#152646"
                    />
                  </svg>

                  <h3 className="text-sm font-semibold text-[#1B1B1B]">
                    Lancer un sondage
                    <br />
                    (Horaires)
                  </h3>
                </div>

                {/* <Switch
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // 👉 envoi direct dans la discussion
                      sendToDiscussion({
                        type: "poll",
                        label: "Horaires",
                      });
                    }
                  }}
                /> */}
              </div>

              {/* Date (toujours affichée, plus de condition) */}
              <button
                type="button"
                className="mt-8 flex w-full items-center justify-between rounded-2xl bg-white px-6 py-5"
                // onClick={() => {
                //   sendToDiscussion({
                //     type: "poll_date",
                //     value: "Mardi 14 Mai - 10:00",
                //   });
                // }}
              >
                <span className="text-sm font-medium text-[#2A2A2A]">
                  Mardi 14 Mai - 10:00
                </span>

                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="#6B6B6B"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 3V7M16 3V7M3 9H21"
                    stroke="#6B6B6B"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            {/* Lieu de rendez-vous */}
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-[#001A0E] dark:text-zinc-200">
                Lieu de rendez-vous
              </p>
              <img
                src="/LIEURDV.png"
                alt="Carte du lieu de rendez-vous"
                className="w-full h-48 object-cover rounded-xl border border-zinc-200/50 dark:border-zinc-800"
              />
            </div>

            {/* Sortie récurrente */}
            <div className="rounded-[28px] bg-[#EEF2F8] p-6">
              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <path d="M4 20L0 16L4 12L5.4 13.45L3.85 15H14V11H16V17H3.85L5.4 18.55L4 20ZM2 9V3H14.15L12.6 1.45L14 0L18 4L14 8L12.6 6.55L14.15 5H4V9H2Z" fill="#152646" />
                </svg>
                <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
                  Rendre cette sortie récurrente
                </label>

                {/* <Switch
                  checked={enabled}
                  onCheckedChange={setEnabled}
                /> */}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
        </form>

        {/* BOUTON ENVOYER (rond, en bas à droite) */}
        <div className="absolute bottom-6 right-6">
          <button
            type="submit"
            form="sortie-form"
            disabled={isLoading || (!isEditMode && !groupId) || !title.trim() || !date || !time || !location.trim()}
            className="w-14 h-14 rounded-full bg-[#425C02] text-white hover:opacity-90 transition flex items-center justify-center cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="text-xs">...</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px] -translate-y-[0.5px]">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 text-center shadow-xl">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-[#001A0E] dark:text-zinc-100">
                {isEditMode ? "Sortie modifiée !" : "Évènement créé !"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {isEditMode ? "Votre sortie a bien été mise à jour." : "Votre sortie a bien été publiée dans le groupe."}
              </p>

              <button
                onClick={() => router.push("/front/discu")}
                className="mt-6 w-full rounded-lg bg-[#152646] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer"
              >
                Retour à la discussion
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
