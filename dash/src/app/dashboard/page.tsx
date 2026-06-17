"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { groupsService, type Group } from "../services/groups.service";
import { usersService } from "../services/users.service";
import { logout } from "../services/_http";

function joinUrl(groupId: string): string {
  const citizenBase =
    process.env.NEXT_PUBLIC_CITIZEN_URL || "http://localhost:3000";
  return `${citizenBase}/front?groupId=${groupId}`;
}

function QrModal({ group, onClose }: { group: Group; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, joinUrl(group.id), {
      width: 250,
      margin: 2,
    });
  }, [group.id]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qrcode-${group.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`QR code du groupe ${group.name}`}
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl flex flex-col gap-4"
      >
        <h3 className="text-lg font-bold text-[#001A0E]">{group.name}</h3>
        <div className="flex items-center justify-center gap-1.5">
          <svg width="12" height="15" viewBox="0 0 12 15" fill="none" aria-hidden="true">
            <path d="M6 7.5C6.4125 7.5 6.76562 7.35312 7.05937 7.05937C7.35312 6.76562 7.5 6.4125 7.5 6C7.5 5.5875 7.35312 5.23438 7.05937 4.94063C6.76562 4.64688 6.4125 4.5 6 4.5C5.5875 4.5 5.23438 4.64688 4.94063 4.94063C4.64688 5.23438 4.5 5.5875 4.5 6C4.5 6.4125 4.64688 6.76562 4.94063 7.05937C5.23438 7.35312 5.5875 7.5 6 7.5ZM6 13.0125C7.525 11.6125 8.65625 10.3406 9.39375 9.19687C10.1313 8.05312 10.5 7.0375 10.5 6.15C10.5 4.7875 10.0656 3.67188 9.19687 2.80312C8.32812 1.93437 7.2625 1.5 6 1.5C4.7375 1.5 3.67188 1.93437 2.80312 2.80312C1.93437 3.67188 1.5 4.7875 1.5 6.15C1.5 7.0375 1.86875 8.05312 2.60625 9.19687C3.34375 10.3406 4.475 11.6125 6 13.0125ZM6 15C3.9875 13.2875 2.48438 11.6969 1.49063 10.2281C0.496875 8.75937 0 7.4 0 6.15C0 4.275 0.603125 2.78125 1.80938 1.66875C3.01562 0.55625 4.4125 0 6 0C7.5875 0 8.98438 0.55625 10.1906 1.66875C11.3969 2.78125 12 4.275 12 6.15C12 7.4 11.5031 8.75937 10.5094 10.2281C9.51562 11.6969 8.0125 13.2875 6 15Z" fill="#424843" />
          </svg>
          <span className="text-sm text-[#424843]">{group.lieu}</span>
        </div>
        <p className="text-sm text-[#424843]">
          Scannez ce QR code pour rejoindre le groupe
        </p>
        <canvas ref={canvasRef} className="mx-auto rounded-lg" />
        <p className="text-xs text-zinc-400">
          Les sessions se remplissent automatiquement ({group.maxMembers} personnes max par session)
        </p>
        <button
          onClick={handleDownload}
          className="w-full rounded-xl border-2 border-[#426200] px-4 py-3 text-sm font-semibold text-[#426200] hover:bg-[#426200]/5 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Télécharger le QR code
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-[#152646] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLieu, setNewLieu] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [checking, setChecking] = useState(true);

  const loadGroups = useCallback(async () => {
    const result = await groupsService.list();
    if (result.isOk) setGroups(result.data);
  }, []);

  useEffect(() => {
    // L'identité vient du cookie de session (via getMe). Le proxy garde déjà /dashboard ;
    // un 401 éventuel est traité dans request() (logout + redirection).
    usersService.getMe().then((result) => {
      if (result.isOk) {
        setFirstName(result.data.user.firstName);
        setChecking(false);
        loadGroups();
      } else {
        router.push("/connexion");
      }
    });
  }, [router, loadGroups]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F5]">
        <p className="text-sm text-[#424843]">Chargement…</p>
      </div>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newLieu.trim()) return;
    setCreating(true);
    setError("");

    const result = await groupsService.create(newName.trim(), newLieu.trim());
    if (!result.isOk) {
      setError(result.error);
      setCreating(false);
      return;
    }

    setNewName("");
    setNewLieu("");
    setShowForm(false);
    setCreating(false);
    await loadGroups();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] font-sans">
      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[rgba(193,200,193,0.3)]">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 41 41" fill="none" className="shrink-0" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M24.2729 35.2628C27.9361 35.135 31.2574 33.7529 33.1683 32.0737C34.2537 31.1199 35.1168 30.0842 35.6512 29.1268C37.0667 26.5908 36.9705 26.1818 33.9416 26.1283C36.8412 25.3695 38.3945 23.848 39.3646 21.5723C40.299 19.3804 40.8243 16.9348 40.6453 15.4407C40.4802 14.0619 38.7057 15.038 37.9598 15.347C40.3127 13.9269 40.5494 11.5308 40.3127 9.14413C39.888 4.86363 37.5289 0 32.3454 0C29.0264 9.64554e-07 26.4352 2.30312 25.5889 4.76623C24.3044 8.50506 25.5069 10.8373 26.3715 12.5142C26.4503 12.667 26.5269 12.8156 26.5979 12.9581C26.1585 12.3554 25.8259 11.8518 25.5603 11.4496C24.9027 10.4539 24.6556 10.0798 24.214 10.3624C23.0157 11.1292 22.1865 16.304 22.6871 19.266C22.0217 17.3508 21.6766 16.4292 21.0052 16.9387C20.3313 17.45 19.1363 19.3894 18.8013 22.4748C18.5534 20.5286 18.4545 20.2452 17.8316 20.7469C16.9929 21.4224 15.4162 23.4092 14.5699 25.6836C14.5802 25.6021 14.5901 25.5231 14.5998 25.4462C14.7315 24.3974 14.8139 23.7412 15.0405 22.5522C12.8642 24.4575 11.8444 25.8965 10.6006 29.0634C10.653 27.5514 11.09 25.2965 11.9902 23.9069C10.6006 24.44 9.0449 26.1443 8.73901 28.6788C8.36601 27.6658 8.39014 27.0254 8.42577 26.0803C8.4282 26.0157 8.43069 25.9497 8.43311 25.8821C7.7514 26.9833 7.75936 29.0849 8.06526 31.0602C7.63535 29.3945 6.66766 28.303 5.68879 28.0496C6.38767 28.7707 6.94467 30.0778 7.16747 31.4889C6.98923 31.1621 6.01397 30.4343 5.36278 30.4343C5.83758 30.7392 6.50534 31.5267 6.80699 32.3524C6.36675 31.974 5.94467 31.7204 5.36278 31.7204C5.88824 31.9761 6.37122 32.5441 6.59068 33.1028C6.62763 33.1969 6.72878 33.2534 6.8263 33.2269C21.652 29.1936 31.8526 20.6836 32.7752 4.70901C34.3272 28.6732 7.6981 34.2095 5.36513 34.6945C5.32098 34.7037 5.28552 34.7111 5.25913 34.7167C5.03382 34.7673 4.78501 34.8231 4.51464 34.8942C3.52492 35.1545 2.65891 35.2508 1.95719 35.3288C0.602299 35.4795 -0.140112 35.562 0.0220073 36.6256C0.133739 37.3586 0.701864 37.6002 1.50935 37.5346C1.9905 37.4955 2.62094 37.2942 3.47112 37.0227C4.28166 36.7639 5.29202 36.4412 6.56334 36.1345C7.10044 36.0049 7.49101 35.9175 8.10276 36.381C9.19634 37.2094 9.89509 38.2068 10.487 39.2587C10.4381 38.6243 10.3892 38.2733 10.1774 37.6741C11.1432 39.0364 11.7064 39.6256 12.7638 40.2513C12.2946 39.5649 12.0845 39.1704 11.7484 38.4618C12.9232 39.4317 14.1162 39.9554 15.7555 39.9554C14.1071 39.3361 13.1873 38.2251 12.5452 37.3872C16.9276 40.4205 25.3132 39.6566 29.0029 35.6847C27.219 35.5911 25.6428 35.4852 24.2729 35.2628Z" fill="#152646"/>
          </svg>
          <span className="text-[20px] font-extrabold text-[#001A0E] leading-[28px] tracking-[-0.5px]">
            Alouette
          </span>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/connexion");
          }}
          className="text-sm text-[#424843] hover:text-[#001A0E] transition"
        >
          Déconnexion
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
        {/* Salutation */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#001A0E] leading-[36px] tracking-[-0.7px]">
            Bonjour {firstName}
          </h1>
          <p className="text-base text-[#424843] mt-1">
            Gérez vos groupes de rencontre
          </p>
        </div>

        {/* Bouton créer */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 border-2 border-[#426200] rounded-xl px-6 py-3 text-base font-semibold text-[#426200] hover:bg-[#426200]/5 transition cursor-pointer mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Créer un groupe
          </button>
        )}

        {/* Formulaire de création */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl p-6 mb-8 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-5"
          >
            <h2 className="text-lg font-bold text-[#001A0E]">Nouveau groupe</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#424843]">
                Nom du groupe
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#999" strokeWidth="1.5"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Marché des Enfants Rouges"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#424843]">
                Lieu
              </label>
              <div className="flex items-center gap-3 bg-zinc-100/60 border border-zinc-200/50 rounded-xl px-4 py-3">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="flex-shrink-0" aria-hidden="true">
                  <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#999" strokeWidth="1.5" />
                  <path d="M8 19s6-4.5 6-11A6 6 0 002 8c0 6.5 6 11 6 11z" stroke="#999" strokeWidth="1.5" />
                </svg>
                <input
                  type="text"
                  required
                  value={newLieu}
                  onChange={(e) => setNewLieu(e.target.value)}
                  placeholder="Ex: 39 Rue de Bretagne, 75003 Paris"
                  className="w-full bg-transparent outline-none text-sm text-[#001A0E] placeholder-zinc-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-[#424843] hover:bg-zinc-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-xl bg-[#152646] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        )}

        {/* Liste des groupes */}
        <section>
          <h2 className="text-lg font-bold text-[#001A0E] mb-4">
            Vos groupes
          </h2>

          {groups.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-[#424843]">
                Aucun groupe pour le moment.
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                Créez votre premier groupe pour commencer.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#001A0E] truncate">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg width="12" height="15" viewBox="0 0 12 15" fill="none" className="flex-shrink-0" aria-hidden="true">
                          <path d="M6 7.5C6.4125 7.5 6.76562 7.35312 7.05937 7.05937C7.35312 6.76562 7.5 6.4125 7.5 6C7.5 5.5875 7.35312 5.23438 7.05937 4.94063C6.76562 4.64688 6.4125 4.5 6 4.5C5.5875 4.5 5.23438 4.64688 4.94063 4.94063C4.64688 5.23438 4.5 5.5875 4.5 6C4.5 6.4125 4.64688 6.76562 4.94063 7.05937C5.23438 7.35312 5.5875 7.5 6 7.5ZM6 13.0125C7.525 11.6125 8.65625 10.3406 9.39375 9.19687C10.1313 8.05312 10.5 7.0375 10.5 6.15C10.5 4.7875 10.0656 3.67188 9.19687 2.80312C8.32812 1.93437 7.2625 1.5 6 1.5C4.7375 1.5 3.67188 1.93437 2.80312 2.80312C1.93437 3.67188 1.5 4.7875 1.5 6.15C1.5 7.0375 1.86875 8.05312 2.60625 9.19687C3.34375 10.3406 4.475 11.6125 6 13.0125ZM6 15C3.9875 13.2875 2.48438 11.6969 1.49063 10.2281C0.496875 8.75937 0 7.4 0 6.15C0 4.275 0.603125 2.78125 1.80938 1.66875C3.01562 0.55625 4.4125 0 6 0C7.5875 0 8.98438 0.55625 10.1906 1.66875C11.3969 2.78125 12 4.275 12 6.15C12 7.4 11.5031 8.75937 10.5094 10.2281C9.51562 11.6969 8.0125 13.2875 6 15Z" fill="#424843" />
                        </svg>
                        <span className="text-sm text-[#424843] truncate">
                          {group.lieu}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-zinc-100/60 rounded-lg px-3 py-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#424843" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="#424843" strokeWidth="1.5"/>
                      </svg>
                      <span className="text-sm font-medium text-[#001A0E]">
                        {group.totalMembers} membre{group.totalMembers !== 1 && "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-100/60 rounded-lg px-3 py-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#424843" strokeWidth="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#424843" strokeWidth="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#424843" strokeWidth="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="#424843" strokeWidth="1.5"/>
                      </svg>
                      <span className="text-sm font-medium text-[#001A0E]">
                        {group.sessionCount} session{group.sessionCount !== 1 && "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-100/60 rounded-lg px-3 py-2">
                      <span className="text-sm text-[#424843]">
                        max {group.maxMembers}/session
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup?.id === group.id ? null : group,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#426200] rounded-lg px-4 py-2.5 text-sm font-semibold text-[#426200] hover:bg-[#426200]/5 transition cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {selectedGroup?.id === group.id ? "Masquer le QR code" : "Afficher le QR code"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal QR Code */}
      {selectedGroup && (
        <QrModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </div>
  );
}
