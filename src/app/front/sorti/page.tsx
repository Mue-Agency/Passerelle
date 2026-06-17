"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { groupsService } from "@/app/services/groups.service";
import { useAuth } from "@/app/hooks/useAuth";
import { outingsService } from "@/app/services/outings.service";
import { messagesService } from "@/app/services/messages.service";

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
  const { isReady } = useAuth();
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
  const [pollEnabled, setPollEnabled] = useState(false);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [pollSlots, setPollSlots] = useState([{ date: "", time: "" }]);

  const isEditMode = !!outingId;
  const suggestionDate = getNextSuggestionDate();

  useEffect(() => {
    const storedGroupId = localStorage.getItem("groupId");
    if (!storedGroupId) return;
    setGroupId(storedGroupId);

    groupsService.getGroup(storedGroupId).then((result) => {
      if (!result.isOk) return;
      setGroupName(result.data.name);
      setLieu(result.data.lieu);
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

      if (pollEnabled && groupId) {
        const filled = pollSlots.filter((s) => s.date && s.time);
        const labels = filled.map((s) =>
          new Date(`${s.date}T${s.time}`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + ` à ${s.time}`
        ).join(", ");
        await messagesService.sendMessage(
          groupId,
          `Sondage horaires pour "${title.trim()}" — Quels créneaux vous conviennent ?\n${labels}`
        );
      }

      if (recurringEnabled && groupId) {
        await messagesService.sendMessage(
          groupId,
          `La sortie "${title.trim()}" a été définie comme récurrente.`
        );
      }
    }

    setShowModal(true);
  }

  const truncatedName = groupName
    ? groupName.length > 30 ? groupName.slice(0, 30) + "..." : groupName
    : "...";

  if (!isReady) return null;

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#FAF9F5] font-sans">
      <main className="w-full max-w-md min-h-screen flex flex-col relative">

        {/* HEADER avec flèche retour */}
        <div className="w-full flex items-center gap-2 px-5 py-3 bg-[#FAF9F5] sticky top-0 z-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-[#001A0E] hover:opacity-70 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-base font-bold text-[#001A0E] leading-7 truncate">
            {truncatedName}
          </span>
        </div>

        <form id="sortie-form" onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 pb-24">

          {/* TITRE */}
          <h2 className="text-xl font-bold text-[#001A0E] mt-4 mb-6">
            {isEditMode ? "Modifier la sortie" : "Proposer une sortie"}
          </h2>

          {/* SECTION SUGGESTION (seulement en mode création) */}
          {!isEditMode && lieu && (
            <div className="flex flex-col gap-3 mb-8">
              <p className="text-base font-bold text-[#001A0E]">
                Suggestion
              </p>
              <div className="flex items-center gap-4 bg-white border border-zinc-200/50 rounded-2xl p-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#C7D7F3] flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
                    <path d="M0 22.5V20H20V22.5H0ZM5 17.5C3.625 17.5 2.44792 17.0104 1.46875 16.0312C0.489583 15.0521 0 13.875 0 12.5V0H20C20.6875 0 21.276 0.244792 21.7656 0.734375C22.2552 1.22396 22.5 1.8125 22.5 2.5V6.25C22.5 6.9375 22.2552 7.52604 21.7656 8.01562C21.276 8.50521 20.6875 8.75 20 8.75H17.5V12.5C17.5 13.875 17.0104 15.0521 16.0312 16.0312C15.0521 17.0104 13.875 17.5 12.5 17.5H5ZM5 15H12.5C13.1875 15 13.776 14.7552 14.2656 14.2656C14.7552 13.776 15 13.1875 15 12.5V2.5H2.5V12.5C2.5 13.1875 2.74479 13.776 3.23438 14.2656C3.72396 14.7552 4.3125 15 5 15ZM17.5 6.25H20V2.5H17.5V6.25Z" fill="#152646"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-[#001A0E] truncate">
                    {lieu}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <svg width="14" height="15" viewBox="0 0 19 20" fill="none" className="flex-shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M14 17V20H16V17H19V15H16V12H14V15H11V17H14ZM0.5875 17.4125C0.979167 17.8042 1.45 18 2 18H9V16H2V8H14V10.025H16V4C16 3.45 15.8042 2.97917 15.4125 2.5875C15.0208 2.19583 14.55 2 14 2H13V0H11V2H5V0H3V2H2C1.45 2 0.979167 2.19583 0.5875 2.5875C0.195833 2.97917 0 3.45 0 4V16C0 16.55 0.195833 17.0208 0.5875 17.4125ZM14 6H2V4H14V6Z" fill="#888" />
                    </svg>
                    <span className="text-sm text-zinc-500">
                      {formatSuggestionDate(suggestionDate)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="w-10 h-10 rounded-full bg-[#152646] text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 transition cursor-pointer"
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
              <label className="text-sm font-semibold text-[#001A0E] pl-1">
                Titre de la sortie
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-4 py-3.5">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="flex-shrink-0">
                  <path d="M0 0h10l6 6v12H0V0z" fill="none" stroke="#999" strokeWidth="1.5" />
                  <path d="M10 0v6h6" fill="none" stroke="#999" strokeWidth="1.5" />
                </svg>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Promenade au parc"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#001A0E]">
                  Date
                </label>
                <div className="flex items-center gap-2 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-3 py-3.5">
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className="flex-shrink-0">
                    <path d="M5 0v3M13 0v3M0 7h18M2 2h14a2 2 0 012 2v14a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#999" strokeWidth="1.5" />
                  </svg>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-[#001A0E]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#001A0E] pl-1">
                  Heure
                </label>
                <div className="flex items-center gap-2 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-3 py-3.5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <circle cx="10" cy="10" r="9" stroke="#999" strokeWidth="1.5" />
                    <path d="M10 4v6l4 2" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-[#001A0E]"
                  />
                </div>
              </div>
            </div>

            {/* Lieu */}
            {/* <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#001A0E] pl-1">
                Lieu
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-4 py-3.5">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="flex-shrink-0">
                  <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#999" strokeWidth="1.5" />
                  <path d="M8 19s6-4.5 6-11A6 6 0 002 8c0 6.5 6 11 6 11z" stroke="#999" strokeWidth="1.5" />
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Saisir une adresse"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] placeholder-zinc-400"
                />
              </div>
            </div> */}

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

                <button
                  type="button"
                  onClick={() => setPollEnabled((v) => !v)}
                  className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                    pollEnabled ? "bg-[#152646]" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all duration-200 ${
                      pollEnabled ? "left-[23px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>

              {/* Créneaux modifiables */}
              <div className="mt-4 flex flex-col gap-2">
                {pollSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 w-full">
                    <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 min-w-0 flex-1">
                      <svg width="13" height="13" viewBox="0 0 18 20" fill="none" className="flex-shrink-0">
                        <path d="M5 0v3M13 0v3M0 7h18M2 2h14a2 2 0 012 2v14a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#6B6B6B" strokeWidth="1.5" />
                      </svg>
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => setPollSlots((prev) => prev.map((s, j) => j === i ? { ...s, date: e.target.value } : s))}
                        className="w-full min-w-0 bg-transparent outline-none text-xs text-[#2A2A2A]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2.5 flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                        <circle cx="10" cy="10" r="9" stroke="#6B6B6B" strokeWidth="1.5" />
                        <path d="M10 4v6l4 2" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => setPollSlots((prev) => prev.map((s, j) => j === i ? { ...s, time: e.target.value } : s))}
                        className="w-[80px] bg-transparent outline-none text-xs text-[#2A2A2A]"
                      />
                    </div>
                    {pollSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPollSlots((prev) => prev.filter((_, j) => j !== i))}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:bg-zinc-100 transition cursor-pointer flex-shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPollSlots((prev) => [...prev, { date: "", time: "" }])}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#152646]/30 py-2.5 text-xs font-medium text-[#152646] hover:bg-[#152646]/5 transition cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Ajouter un créneau
                </button>
              </div>
            </div>

        {/* Lieu de rendez-vous */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[#001A0E]">
            Lieu de rendez-vous
          </p>

          <button
            type="button"
            className="text-sm font-semibold text-[#152646] hover:opacity-70 transition"
          >
            Changer
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl">
          {/* Image */}
          <img
            src="/LIEURDV.png"
            alt="Lieu"
            className="w-full h-48 object-cover rounded-xl border border-zinc-200/50"
          />

          {/* Carte adresse */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/95 px-1 py-1 shadow-lg backdrop-blur">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2F8] flex-shrink-0">
                <svg
                  width="14"
                  height="18"
                  viewBox="0 0 16 20"
                  fill="none"
                >
                  <path
                    d="M8 10a2 2 0 100-4 2 2 0 000 4z"
                    stroke="#152646"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 19s6-4.5 6-11A6 6 0 002 8c0 6.5 6 11 6 11z"
                    stroke="#152646"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <p className="truncate text-xs font-medium text-[#001A0E]">
                {location || "Aucune adresse sélectionnée"}
              </p>
            </div>
          </div>
        </div>

            {/* Sortie récurrente */}
            <div className="rounded-[28px] bg-[#EEF2F8] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <path d="M4 20L0 16L4 12L5.4 13.45L3.85 15H14V11H16V17H3.85L5.4 18.55L4 20ZM2 9V3H14.15L12.6 1.45L14 0L18 4L14 8L12.6 6.55L14.15 5H4V9H2Z" fill="#152646" />
                </svg>
                <label className="text-sm font-semibold text-[#001A0E]">
                  Rendre cette sortie récurrente
                </label>
                </div>

                <button
                  type="button"
                  onClick={() => setRecurringEnabled((v) => !v)}
                  className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                    recurringEnabled ? "bg-[#152646]" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all duration-200 ${
                      recurringEnabled ? "left-[23px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
        </form>

        {/* BOUTON ENVOYER (rond, en bas à droite) */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2">
  <button
    type="submit"
    form="sortie-form"
    disabled={
      isLoading ||
      (!isEditMode && !groupId) ||
      !title.trim() ||
      !date ||
      !time ||
      !location.trim()
    }
    className="h-14 px-6 rounded-full bg-[#152646] text-white hover:opacity-90 transition flex items-center justify-center cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold"
  >
    {isLoading ? "..." : "Créer un évènement"}
  </button>
</div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C7D7F3]">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 40 40" fill="none" >
                  <path d="M17.2 29.2L31.3 15.1L28.5 12.3L17.2 23.6L11.5 17.9L8.7 20.7L17.2 29.2ZM20 40C17.2333 40 14.6333 39.475 12.2 38.425C9.76667 37.375 7.65 35.95 5.85 34.15C4.05 32.35 2.625 30.2333 1.575 27.8C0.525 25.3667 0 22.7667 0 20C0 17.2333 0.525 14.6333 1.575 12.2C2.625 9.76667 4.05 7.65 5.85 5.85C7.65 4.05 9.76667 2.625 12.2 1.575C14.6333 0.525 17.2333 0 20 0C22.7667 0 25.3667 0.525 27.8 1.575C30.2333 2.625 32.35 4.05 34.15 5.85C35.95 7.65 37.375 9.76667 38.425 12.2C39.475 14.6333 40 17.2333 40 20C40 22.7667 39.475 25.3667 38.425 27.8C37.375 30.2333 35.95 32.35 34.15 34.15C32.35 35.95 30.2333 37.375 27.8 38.425C25.3667 39.475 22.7667 40 20 40Z" fill="#152646" />
                </svg>
              </div>
              

              <h2 className="text-lg font-semibold text-[#001A0E]">
                {isEditMode ? "Sortie modifiée !" : "Évènement créé !"}
              </h2>

              <p className="mt-2 text-small text-zinc-500">
                {isEditMode ? "Votre sortie a été modifiée avec succès. Préparez-vous pour un moment convivial !" : "Votre sortie a été créée avec succès. Préparez-vous pour un moment convivial !"}
              </p>

              {/* <div className="flex items-center gap-3 rounded-2xl border border-[#D8E2F2] bg-[#EEF3FB] px-4 py-3 top-4 mt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7D7F3] flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M7.95 16.35L4.4 12.8L5.85 11.35L7.95 13.45L12.15 9.25L13.6 10.7L7.95 16.35ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18ZM2 6H16V4H2V6ZM2 6V4V6Z" fill="#3B4B39"/>
                  </svg>
                </div>

                {/* <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[#001A0E]">
                    Confirmation d'activité
                  </p>
                  <p className="text-xs text-zinc-500">
                    Vous êtes inscrit à la sortie
                  </p>
                </div> 
              </div> */}

              <button
                onClick={() => router.push("/front/discu")}
                className="mt-6 w-full rounded-lg bg-[#152646] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Retour au Chat 
              </button>
               
              <div className="flex items-center justify-center gap-2 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
                <path d="M5.2125 10.1625L9.45 5.925L8.38125 4.85625L5.2125 8.025L3.6375 6.45L2.56875 7.51875L5.2125 10.1625ZM6 15C4.2625 14.5625 2.82812 13.5656 1.69687 12.0094C0.565625 10.4531 0 8.725 0 6.825V2.25L6 0L12 2.25V6.825C12 8.725 11.4344 10.4531 10.3031 12.0094C9.17188 13.5656 7.7375 14.5625 6 15ZM6 13.425C7.3 13.0125 8.375 12.1875 9.225 10.95C10.075 9.7125 10.5 8.3375 10.5 6.825V3.28125L6 1.59375L1.5 3.28125V6.825C1.5 8.3375 1.925 9.7125 2.775 10.95C3.625 12.1875 4.7 13.0125 6 13.425Z" fill="#45483A"/>
              </svg>
              <p className="text-sm text-zinc-500 items-center">
                Action confirmée et sécurisée
              </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
