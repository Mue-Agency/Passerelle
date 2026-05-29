"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { configService } from "@/app/services/config.service";
import { groupsService } from "@/app/services/groups.service";

export default function DiscussionPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [groupName, setGroupName] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    configService.getConfig().then(async (configResult) => {
      if (!configResult.isOk) return;
      setGroupId(configResult.data.groupId);

      const groupResult = await groupsService.getGroup(configResult.data.groupId);
      if (groupResult.isOk) setGroupName(groupResult.data.name);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setNewMessage("");
  }

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#FAF9F5] font-sans dark:bg-black">
      <main className="flex w-full max-w-md min-h-screen flex-col items-center justify-between p-6">

        {/* 1. EN-TÊTE DU GROUPE */}
        <div className="w-full text-center border-b border-zinc-200/60 dark:border-zinc-800 p-6 pb-4 bg-[#FAF9F5] dark:bg-black">
          <h1 className="text-xl font-bold text-[#001A0E] dark:text-zinc-50 leading-7">
            {groupName ?? "..."}
          </h1>
        </div>

        {/* 2. FIL D'ACTIVITÉ / MESSAGES */}
        <div className="w-full px-6 py-4 space-y-6 flex-1">

          {/* Carte de Bienvenue */}
          <div className="flex flex-col p-4 items-start gap-6 self-stretch bg-white dark:bg-zinc-900 w-full mt-2">
            <div>
              <h2 className="text-lg font-bold text-[#001A0E] dark:text-zinc-50 mb-2 leading-6 text-center">
                Bienvenue dans le groupe !
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-center">
                Ce groupe réunit des personnes que vous avez peut-être déjà croisées ici.
              </p>
            </div>

            <p className="text-sm font-medium text-[#001A0E] dark:text-zinc-300 text-center">
              Pour commencer, vous pouvez proposer un moment ensemble
            </p>

            <button
              onClick={() => router.push("/front/sorti")}
              className="mx-auto flex items-center justify-center gap-2 border border-zinc-100/50 dark:border-zinc-800 rounded-full px-6 py-2.5 text-sm font-semibold text-[#426200] hover:bg-[#426200]/5 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14 17V20H16V17H19V15H16V12H14V15H11V17H14ZM0.5875 17.4125C0.979167 17.8042 1.45 18 2 18H9V16H2V8H14V10.025H16V4C16 3.45 15.8042 2.97917 15.4125 2.5875C15.0208 2.19583 14.55 2 14 2H13V0H11V2H5V0H3V2H2C1.45 2 0.979167 2.19583 0.5875 2.5875C0.195833 2.97917 0 3.45 0 4V16C0 16.55 0.195833 17.0208 0.5875 17.4125ZM14 6H2V4H14V6Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[#426200]">Proposer une sortie</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium px-4">
            <p>Groupe modéré pour garantir la sécurité de tous.</p>
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* 3. ZONE DE SAISIE */}
        <div className="w-full p-6 pt-2 pb-6 mt-auto bg-[#FAF9F5] dark:bg-black border-t border-zinc-200/40 dark:border-zinc-800 flex items-center gap-3">

          <button
            type="button"
            onClick={() => groupId && router.push("/front/sorti")}
            className="text-zinc-700 dark:text-zinc-300 p-1 hover:opacity-70 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="12" y1="14" x2="12" y2="20"></line>
              <line x1="9" y1="17" x2="15" y2="17"></line>
            </svg>
          </button>

          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-[#EFEFEF]/60 dark:bg-zinc-900 px-5 py-3 text-sm text-black dark:text-zinc-50 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#426200] transition"
            />
            <button
              type="submit"
              className="rounded-full bg-[#425C02] w-11 h-11 text-white hover:opacity-90 transition flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px] -translate-y-[0.5px]">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
