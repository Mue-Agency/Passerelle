"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { groupsService } from "@/app/services/groups.service";
import { outingsService } from "@/app/services/outings.service";

export default function SortiePage() {
  const router = useRouter();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    configService.getConfig().then(async (configResult) => {
      if (!configResult.isOk) return;
      setGroupId(configResult.data.groupId);

      const groupResult = await groupsService.getGroup(configResult.data.groupId);
      if (groupResult.isOk) setGroupName(groupResult.data.name);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !date || !time || !location.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!groupId) {
      setError("Impossible de récupérer le groupe.");
      return;
    }

    const isoDate = `${date}T${time}:00`;

    setIsLoading(true);
    const result = await outingsService.proposeOuting(groupId, {
      title: title.trim(),
      date: isoDate,
      location: location.trim(),
      maxSpots: 3,
    });
    setIsLoading(false);

    if (!result.isOk) {
      setError(result.error);
      return;
    }

    router.push("/front/discu");
  }

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#FAF9F5] font-sans dark:bg-black">
      <main className="w-full max-w-md min-h-screen flex flex-col p-6 gap-6">

        {/* 1. EN-TÊTE DU GROUPE */}
        <div className="w-full text-center border-b border-zinc-200/60 dark:border-zinc-800 p-6 pb-4 bg-[#FAF9F5] dark:bg-black">
          <h1 className="text-xl font-bold text-[#001A0E] dark:text-zinc-50 leading-7">
            {groupName ?? "..."}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="w-full flex flex-col gap-4 mt-2">
            <p className="text-lg font-semibold text-[#001A0E] dark:text-zinc-200">Proposer une sortie</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#001A0E] dark:text-zinc-200">
              Titre de la sortie
            </label>
            <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-3">
              <span className="text-zinc-400">A</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
                />
              </div>
            </div>

            {/* HEURE */}
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
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Saisir une adresse"
                className="w-full bg-transparent outline-none text-sm text-[#001A0E] dark:text-zinc-100"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !groupId}
            className="w-full rounded-lg bg-[#426200] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Envoi..." : "Proposer la sortie"}
          </button>

        </form>
      </main>
    </div>
  );
}
