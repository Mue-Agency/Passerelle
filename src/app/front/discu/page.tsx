"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { groupsService } from "@/app/services/groups.service";
import { messagesService } from "@/app/services/messages.service";
import { useMessages } from "@/app/hooks/useMessages";
import { useAuth } from "@/app/hooks/useAuth";
import { outingsService } from "@/app/services/outings.service";
import type { MessageOut } from "@/app/hooks/useMessages";

function formatTime(sentAt: Date | string): string {
  return new Date(sentAt as string).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOutingDate(date: Date | string): string {
  const d = new Date(date as string);
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const time = minutes > 0 ? `${hours}h${String(minutes).padStart(2, "0")}` : `${hours}h`;
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, à ${time}`;
}

function AuthorName(user: MessageOut["user"]): string {
  return `${user.firstName} ${user.lastName.charAt(0)}.`;
}

export default function DiscussionPage() {
  const router = useRouter();
  const { isReady } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<{ id: string; firstName: string; lastName: string; avatarUrl: string | null }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const { messages, isLoading } = useMessages(groupId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    setMyUserId(localStorage.getItem("userId"));

    const storedGroupId = localStorage.getItem("groupId");
    if (!storedGroupId) return;
    setGroupId(storedGroupId);

    groupsService.getGroup(storedGroupId).then((result) => {
      if (result.isOk) setGroupName(result.data.name);
    });

    groupsService.getGroupMembers(storedGroupId).then((result) => {
      if (result.isOk) setMembers(result.data.members);
    });
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function handleScroll() {
      const el = scrollContainerRef.current;
      if (!el) return;
      isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (isAtBottomRef.current) setUnreadCount(0);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const newCount = messages.length - prevMessageCountRef.current;
    if (prevMessageCountRef.current === 0) {
      messagesEndRef.current?.scrollIntoView();
    } else if (newCount > 0) {
      if (isAtBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setUnreadCount((prev) => prev + newCount);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    setSendError("");
    const content = newMessage.trim();
    setNewMessage("");

    const result = await messagesService.sendMessage(groupId, content);
    if (result.isOk) {
      isAtBottomRef.current = true;
      setUnreadCount(0);
    } else {
      setSendError(result.error);
      setNewMessage(content);
    }
  }

  if (!isReady) return null;

  return (
    // <div className="w-full h-dvh flex justify-center bg-[#FAF9F5] font-sans dark:bg-black overflow-hidden">
      <div className="w-full h-dvh flex justify-center overflow-hidden font-sans bg-gradient-to-t from-pink-200/40 via-pink-100/20 to-[#FAF9F5] dark:bg-black">
      <main className="flex w-full max-w-md h-full flex-col relative">

        {/* EN-TÊTE — h-[52px], border-b, px-[20px] */}
        <div className="w-full flex items-center h-[90px] px-[20px] border-b border-[rgba(193,200,193,0.3)] bg-[#FAF9F5] dark:bg-black sticky top-0 z-10">

          {/* Espace symétrique à gauche */}
          <div className="w-[40px] flex-shrink-0" />

          {/* Groupe — centre */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-[4px] cursor-pointer"
            onClick={() => router.push("/front/membre")}
          >
            <div className="flex -space-x-3">
              {members.slice(0, 3).map((m, i) => (
                m.avatarUrl ? (
                  <img
                    key={m.id}
                    src={m.avatarUrl}
                    alt={`${m.firstName} ${m.lastName}`}
                    className={`w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 object-cover ${["z-30", "z-20", "z-10"][i]}`}
                  />
                ) : (
                  <div
                    key={m.id}
                    className={`w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-[#C7D7F3] flex items-center justify-center ${["z-30", "z-20", "z-10"][i]}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 19" fill="none">
                      <path d="M10.5 4.5C10.5 3.11929 9.38071 2 8 2C6.61929 2 5.5 3.11929 5.5 4.5C5.5 5.88071 6.61929 7 8 7V9C5.51472 9 3.5 6.98528 3.5 4.5C3.5 2.01472 5.51472 0 8 0C10.4853 0 12.5 2.01472 12.5 4.5C12.5 6.98528 10.4853 9 8 9V7C9.38071 7 10.5 5.88071 10.5 4.5Z" fill="#152646"/>
                      <path d="M8 10C12.5 10 16 14.0817 16 18.5H14C14 15.1863 11.5 12 8 12C4.5 12 2 15.1863 2 18.5H0C0 14.0817 3.5 10 8 10Z" fill="#152646"/>
                    </svg>
                  </div>
                )
              ))}
            </div>
            <h1 className="text-[20px] font-bold text-[#001A0E] dark:text-zinc-50 leading-[28px] tracking-[-0.5px] truncate">
              {groupName ?? "..."}
            </h1>
          </div>

          {/* Bouton profil — droite */}
          <button
            onClick={() => router.push("/front/profil")}
            className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#E3EBF9] flex-shrink-0 overflow-hidden"
          >
            {members.find((m) => m.id === myUserId)?.avatarUrl ? (
              <img
                src={members.find((m) => m.id === myUserId)!.avatarUrl!}
                alt="Mon profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
                <path d="M10.5 4.5C10.5 3.11929 9.38071 2 8 2C6.61929 2 5.5 3.11929 5.5 4.5C5.5 5.88071 6.61929 7 8 7V9C5.51472 9 3.5 6.98528 3.5 4.5C3.5 2.01472 5.51472 0 8 0C10.4853 0 12.5 2.01472 12.5 4.5C12.5 6.98528 10.4853 9 8 9V7C9.38071 7 10.5 5.88071 10.5 4.5Z" fill="#152646"/>
                <path d="M8 10C12.5 10 16 14.0817 16 18.5H14C14 15.1863 11.5 12 8 12C4.5 12 2 15.1863 2 18.5H0C0 14.0817 3.5 10 8 10Z" fill="#152646"/>
              </svg>
            )}
          </button>

        </div>

        {/* FIL D'ACTIVITÉ — px-[24px], gap-[24px] */}
        <div ref={scrollContainerRef} className="flex-1 px-[24px] py-[24px] flex flex-col gap-[24px] overflow-y-auto scrollbar-none">

          {/* Carte de bienvenue — px-[32px] intérieur, card p-[16px], rounded-[12px] */}
          <div className="px-[32px]">
            <div className="flex flex-col gap-[24px] items-start p-[16px] bg-[#E3EBF9] dark:bg-zinc-900 rounded-[12px] w-full">
              <div className="w-full flex flex-col gap-[16px] text-center text-[#001A0E] dark:text-zinc-50">
                <h2 className="text-[18px] font-bold leading-normal">
                  Bienvenue dans le groupe !
                </h2>
                <p className="text-[14px] leading-normal text-[#001A0E] dark:text-zinc-400">
                  Ce groupe réunit des personnes que vous avez peut-être déjà croisées ici.
                </p> 
              </div>
              <div className="w-full flex flex-col gap-[16px] items-start">
                <p className="text-[16px] font-semibold text-[#001A0E] dark:text-zinc-300 text-center w-full leading-normal">
                  Pour commencer, vous pouvez proposer un moment ensemble
                </p>
                <button
                  onClick={() => router.push("/front/sorti")}
                  className="w-full flex items-center justify-center gap-[12px] border-2 border-[#152646] rounded-[8px] px-[24px] py-[8px] text-[16px] font-semibold text-[#152646] hover:bg-[#152646]/5 transition cursor-pointer bg-white "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14 17V20H16V17H19V15H16V12H14V15H11V17H14ZM0.5875 17.4125C0.979167 17.8042 1.45 18 2 18H9V16H2V8H14V10.025H16V4C16 3.45 15.8042 2.97917 15.4125 2.5875C15.0208 2.19583 14.55 2 14 2H13V0H11V2H5V0H3V2H2C1.45 2 0.979167 2.19583 0.5875 2.5875C0.195833 2.97917 0 3.45 0 4V16C0 16.55 0.195833 17.0208 0.5875 17.4125ZM14 6H2V4H14V6Z" fill="currentColor" />
                  </svg>
                  Proposer une sortie
                </button>
              </div>
            </div>
          </div>

          {/* Infos système — text-[14px], text-[#424843] */}
          <div className="text-center text-[14px] text-[#424843] dark:text-zinc-400 leading-normal">
            Groupe modéré pour garantir la sécurité de tous.
          </div>

          {/* Messages */}
          {isLoading ? (
            <div className="text-center text-[14px] text-[#424843]">Chargement...</div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {messages.map((msg) => (
                <MessageItem key={msg.id} msg={msg} isMe={msg.user.id === myUserId} myUserId={myUserId} members={members} />
              ))}
            </div>
          )}

          {sendError && (
            <p className="text-[14px] text-red-500 text-center">{sendError}</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BULLE NOUVEAUX MESSAGES */}
        {unreadCount > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-[6px] bg-[#E3EBF9] text-white text-[13px] font-semibold px-[14px] py-[7px] rounded-full shadow-lg hover:opacity-90 transition cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadCount} nouveau{unreadCount > 1 ? "x" : ""} message{unreadCount > 1 ? "s" : ""}
          </button>
        )}

        {/* ZONE DE SAISIE — px-[16px], pt-[17px] pb-[16px], border-t */}
        <div className="w-full px-[16px] pt-[17px] pb-[16px] bg-[#FAF9F5] dark:bg-black border-t border-[rgba(193,200,193,0.2)] flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => router.push("/front/sorti")}
            className="w-[35px] h-[36px] flex items-center justify-center text-[#424843] dark:text-zinc-300 hover:opacity-70 transition cursor-pointer flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M14 17V20H16V17H19V15H16V12H14V15H11V17H14ZM0.5875 17.4125C0.979167 17.8042 1.45 18 2 18H9V16H2V8H14V10.025H16V4C16 3.45 15.8042 2.97917 15.4125 2.5875C15.0208 2.19583 14.55 2 14 2H13V0H11V2H5V0H3V2H2C1.45 2 0.979167 2.19583 0.5875 2.5875C0.195833 2.97917 0 3.45 0 4V16C0 16.55 0.195833 17.0208 0.5875 17.4125ZM14 6H2V4H14V6Z" fill="#152646"/>
            </svg> 
          </button>
 
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-[12px]">
            <div className="bg-[#EFEEEA] dark:bg-zinc-900 rounded-full px-[24px] py-[16px] flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="w-full bg-transparent outline-none text-[16px] text-[#001A0E] dark:text-zinc-50 placeholder-[#727973] leading-normal"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || !groupId}
              className="w-[52px] h-[52px] rounded-full bg-[#152646] text-white hover:opacity-90 transition flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[2px]">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}

/* ─── MessageItem ─── */

function MessageItem({ msg, isMe, myUserId, members }: { msg: MessageOut; isMe: boolean; myUserId: string | null; members: { id: string; firstName: string; lastName: string; avatarUrl: string | null }[] }) {
  if (msg.type === "JOIN") {
    return (
      <div className="text-center text-[14px] text-[#424843] dark:text-zinc-400 leading-normal">
        {AuthorName(msg.user)} a rejoint le groupe
      </div>
    );
  }

  if (msg.type === "OUTING" && msg.outing) {
    return <OutingCard msg={msg} isMe={isMe} myUserId={myUserId} members={members} />;
  }

  return (
    <div className={`flex flex-col w-full ${isMe ? "items-end pl-[56px]" : "items-start pr-[56px]"}`}>
      {!isMe && (
        <span className="text-[14px] text-[#424843] dark:text-zinc-400 mb-[4px] leading-normal">
          {AuthorName(msg.user)}
        </span>
      )}
      <div className={`max-w-[286px] rounded-[12px] p-[16px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-end ${
        isMe
          ? "bg-[#152546] text-white rounded-tl-[12px] rounded-bl-[12px] rounded-br-[12px] rounded-tr-none"
          : "bg-[#E3EBF9] dark:bg-zinc-900 text-[#FFFFF] dark:text-zinc-50 rounded-tr-[12px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-none"
      }`}>
        <p className="break-words leading-normal text-[16px] flex-1 min-w-0">{msg.content}</p>
        <span className={`text-[12px] leading-[18px] whitespace-nowrap flex-shrink-0 ${isMe ? "text-white/70" : "text-[#727973]"}`}>
          {formatTime(msg.sentAt)}
        </span>
      </div>
    </div>
  );
}

/* ─── SpotsIndicator — dots 12x12, gap-[8px] ─── */
    function SpotsIndicator({
      participantCount,
      participantCountrefused,
      maxSpots,
      isMe,
      onClick,
    }: {
      participantCount: number;
      participantCountrefused: number;
      
      maxSpots: number;
      isMe: boolean;
      onClick?: () => void;
    }) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-[8px] cursor-pointer"
        >
          {Array.from({ length: maxSpots }, (_, i) => (
            <span
              key={i}
              className={`w-[12px] h-[12px] rounded-full ${
                i < participantCount
                  ? isMe
                    ? "bg-white"
                    : "bg-[#426200]"
                  : isMe
                  ? "border-2 border-white/50"
                  : "border-2 border-[#C1C8C1]"
              }`}
            />
          ))}
        </button>
      );
    }

/* ─── OutingCard ─── */
    function OutingCard({ msg, isMe, myUserId, members }: { msg: MessageOut; isMe: boolean; myUserId: string | null; members: { id: string; firstName: string; lastName: string; avatarUrl: string | null }[] }) {
      const router = useRouter();
      const [isActing, setIsActing] = useState(false);
      const [showParticipants, setShowParticipants] = useState(false);
      const [hasJoined, setHasJoined] = useState(msg.outing?.isParticipant ?? false);
      const [hasRefused, setHasRefused] = useState(false);
      const [participants, setParticipants] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
      const [refusedCount, setRefusedCount] = useState(msg.outing?.participantCountrefused ?? 0);

      const currentUser = myUserId ? members.find((m) => m.id === myUserId) ?? null : null;

      useEffect(() => {
        if (!msg.outing) return;
        outingsService.getOuting(msg.outing.id).then((result) => {
          if (result.isOk) setParticipants(result.data.participants);
        });
      }, [msg.outing?.id]);

      if (!msg.outing) return null;
      const { outing } = msg;
      const spotsLeft = outing.maxSpots - outing.participantCount;

      async function handleJoin() {
        setHasJoined(true);
        setHasRefused(false);
        if (currentUser) {
          setParticipants((prev) =>
            prev.some((p) => p.id === currentUser.id) ? prev : [...prev, currentUser]
          );
          setRefusedCount((prev) => (hasRefused ? Math.max(0, prev - 1) : prev));
        }
        try {
          await outingsService.joinOuting(outing.id);
        } catch {
          setHasJoined(false);
          if (currentUser) setParticipants((prev) => prev.filter((p) => p.id !== currentUser.id));
        }
      }

      async function handleLeave() {
        setHasJoined(false);
        if (currentUser) setParticipants((prev) => prev.filter((p) => p.id !== currentUser.id));
        try {
          await outingsService.leaveOuting(outing.id);
        } catch {
          setHasJoined(true);
          if (currentUser) setParticipants((prev) => [...prev, currentUser]);
        }
      }

      async function handleRefuse() {
        setHasRefused(true);
        setHasJoined(false);
        if (currentUser) setParticipants((prev) => prev.filter((p) => p.id !== currentUser.id));
        setRefusedCount((prev) => prev + 1);
        try {
          await outingsService.refuseOuting(outing.id);
        } catch {
          setHasRefused(false);
          setRefusedCount((prev) => Math.max(0, prev - 1));
        }
      }
  

    function formatShortDate(date: Date | string): string {
      return new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }

    function AuthorName(user: MessageOut["user"]): string {
      return `${user.firstName} ${user.lastName.charAt(0)}.`;
    }

  return (
    <div className={`flex flex-col w-full ${isMe ? "items-end pl-[56px]" : "items-start pr-[56px]"}`}>
      <div className={`w-full rounded-[12px] p-[16px] flex flex-col gap-[16px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ${
        isMe
          ? "bg-[#152646] text-white"
          : "bg-[#E3EBF9] dark:bg-zinc-900 text-[#001A0E] dark:text-zinc-50"
      }`}>
        {/* Contenu */}
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[8px]">
            <p className={`text-[18px] font-semibold leading-normal ${isMe ? "text-white" : "text-[#001A0E] dark:text-zinc-100"}`}>
              {outing.title}
            </p>
            <div className="flex flex-col gap-[4px]">
              <p className={`text-[16px] leading-normal ${isMe ? "text-white/80" : "text-[#001A0E] dark:text-zinc-300"}`}>
                {formatOutingDate(outing.date)}
              </p>
              <p className={`text-[16px] leading-normal ${isMe ? "text-white/80" : "text-[#001A0E] dark:text-zinc-300"}`}>
                {outing.location}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className={`text-[14px] leading-normal ${isMe ? "text-white/70" : "text-[#424843] dark:text-zinc-400"}`}>
              Places : {outing.participantCount}/{outing.maxSpots}
            </p>
            {/* <SpotsIndicator participantCount={outing.participantCount} maxSpots={outing.maxSpots} isMe={isMe} /> */}
            {/* <SpotsIndicator
              participantCount={outing.participantCount}
              participantCountrefused={outing.participantCountrefused}
              maxSpots={outing.maxSpots}
              isMe={isMe}
              onClick={() => setShowParticipants(true)}
            /> */}
           </div>
          <button
            type="button"
            onClick={() => setShowParticipants(true)}
            className="flex items-center gap-[8px] hover:opacity-70 transition cursor-pointer"
          >
            <div className="flex items-center">
              {participants.map((p, i) => (
                <img
                  key={p.id}
                  className={`w-8 h-8 rounded-full border-2 ${isMe ? "border-white/30" : "border-white"} ${i === 0 ? "" : "-ml-2"}`}
                  src="/assets/group-placeholder.png"
                  alt={`${p.firstName} ${p.lastName}`}
                />
              ))}
              {participants.length === 0 && (
                <span className={`text-[13px] ${isMe ? "text-white/60" : "text-[#727973]"}`}>Aucun participant</span>
              )}
            </div>
            {participants.length > 0 && (
              <span className={`text-[13px] ${isMe ? "text-white/70" : "text-[#727973]"}`}>
                Voir ({participants.length})
              </span>
            )}
          </button>
        </div>

        {/* Boutons action */}
        <div className="flex flex-col gap-[8px]">
        {isMe ? (
          <button
            onClick={() => router.push(`/front/sorti?outingId=${outing.id}`)}
            className="w-full rounded-[8px] bg-white/20 border border-white/30 text-white text-[16px] font-semibold py-[8px] px-[24px] hover:bg-white/30 transition cursor-pointer text-center"
          >
            Modifier
          </button>
        ) : (
          <>
            {hasJoined ? (
              <button
                onClick={handleLeave}
                className="w-full rounded-[8px] border-2 border-[#152646] text-[#152646] bg-transparent text-[16px] font-semibold py-[8px] px-[24px] cursor-pointer text-center"
              >
                Quitter
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="w-full rounded-[8px] bg-[#152646] text-white text-[16px] font-semibold py-[8px] px-[24px] cursor-pointer text-center"
              >
                Continuer
              </button>
            )}

            {hasRefused ? (
              <div className="w-full rounded-[8px] bg-zinc-100 text-[#727973] text-[16px] font-semibold py-[8px] px-[24px] text-center">
                Vous avez refusé
              </div>
            ) : (
              <button
                onClick={handleRefuse}
                className="w-full rounded-[8px] border border-[#C1C8C1] text-[#727973] bg-white text-[16px] font-semibold py-[8px] px-[24px] cursor-pointer text-center"
              >
                Refuser
              </button>
            )}
          </>
        )}
        </div>
          </div>

      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowParticipants(false)} />

          <div className="relative w-full max-w-md mx-auto h-[60vh] bg-white dark:bg-zinc-900 rounded-t-[24px] flex flex-col overflow-hidden">
            {/* Handle */}
            <div className="flex-shrink-0 pt-[12px] pb-[4px] px-[20px]">
              <div className="w-[40px] h-[4px] bg-zinc-300 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-[20px] py-[12px] border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-[16px] font-semibold text-[#001A0E] dark:text-zinc-50">{outing.title}</p>
                <p className="text-[13px] text-[#727973]">{formatShortDate(outing.date)}</p>
              </div>
              <button type="button" onClick={() => setShowParticipants(false)} className="w-[32px] h-[32px] flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[#727973] cursor-pointer hover:opacity-70 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="relative flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-[20px] py-[16px] flex flex-col gap-[20px]">

              {/* Acceptés */}
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#426200" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-[14px] font-semibold text-[#426200]">Acceptés · {participants.length}</span>
                </div>
                {participants.length === 0 ? (
                  <p className="text-[13px] text-[#727973] pl-[32px]">Aucun participant pour l'instant</p>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[12px] bg-[#F4FAF0] dark:bg-zinc-800">
                        <img src="/assets/group-placeholder.png" alt={`${p.firstName} ${p.lastName}`} className="w-[36px] h-[36px] rounded-full flex-shrink-0" />
                        <span className="text-[14px] font-medium text-[#001A0E] dark:text-zinc-100">{p.firstName} {p.lastName.charAt(0)}.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refusés */}
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#727973" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <span className="text-[14px] font-semibold text-[#727973]">Refusés · {refusedCount}</span>
                </div>
                {refusedCount === 0 ? (
                  <p className="text-[13px] text-[#727973] pl-[32px]">Aucun refus pour l'instant</p>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    {Array.from({ length: refusedCount }).map((_, i) => (
                      <div key={i} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[12px] bg-zinc-50 dark:bg-zinc-800">
                        <div className="w-[36px] h-[36px] rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
                        <span className="text-[14px] text-[#727973]">Participant anonyme</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
              {/* Dégradé rose en bas */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-100 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

