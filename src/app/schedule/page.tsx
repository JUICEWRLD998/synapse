"use client";

import { useEffect, useState, useRef } from "react";
import {
  Scheduler,
  DayView,
  TimelineView,
} from "@progress/kendo-react-scheduler";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Calendar,
  Search,
  Tag,
  User,
  Clock,
  Check,
  Plus,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";
import { Talk, Track, Speaker } from "@/types";

/* ── Attendance toast ─────────────────────────────────────────────── */
interface ToastMsg { id: number; text: string; type: "add" | "remove" }

function AttendanceToast({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium glass-strong shadow-lg ${
              t.type === "add"
                ? "text-emerald-400 border-emerald-500/20"
                : "text-zinc-400 border-white/[0.06]"
            }`}
          >
            {t.type === "add" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <MinusCircle className="h-4 w-4 text-zinc-500 shrink-0" />
            )}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Rolling number counter ───────────────────────────────────────── */
function RollingNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    setDisplay(value);
  }, [value]);
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={display}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="inline-block font-semibold tabular-nums"
      >
        {display}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Session card used in the directory list ─────────────────────── */
function SessionCard({
  item,
  onSelect,
  onToggle,
}: {
  item: ReturnType<typeof buildGridItem>;
  onSelect: (t: Talk) => void;
  onToggle: (id: string, attending: boolean) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-xl border flex flex-col transition-all duration-200 overflow-hidden ${
        item.isAttended
          ? "bg-emerald-950/20 border-emerald-500/25 hover:border-emerald-500/40"
          : "bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-900/60"
      }`}
    >
      {/* Track colour bar — full width top stripe */}
      <div
        className="h-[3px] w-full shrink-0"
        style={{ backgroundColor: item.trackColor }}
      />

      <div className="p-4 flex flex-col gap-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => onSelect(item.rawTalk)}
            className="text-left text-sm font-semibold text-white hover:text-violet-300 transition-colors leading-snug"
          >
            {item.title}
          </button>

          {/* Attend button */}
          <button
            onClick={() => onToggle(item.id, !item.isAttended)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              item.isAttended
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30"
                : "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-violet-600 hover:text-white hover:border-violet-500"
            }`}
          >
            {item.isAttended ? (
              <><Check className="h-3 w-3" />Attending</>
            ) : (
              <><Plus className="h-3 w-3" />Add</>
            )}
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Speaker */}
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <User className="h-3 w-3 text-zinc-500 shrink-0" />
            {item.speaker}
          </span>

          <span className="text-zinc-700">·</span>

          {/* Time */}
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="h-3 w-3 text-zinc-500 shrink-0" />
            {item.time}
          </span>

          <span className="text-zinc-700">·</span>

          {/* Day */}
          <span className="text-zinc-400">{item.day}</span>
        </div>

        {/* Track + Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Track pill — white text on track colour */}
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{
              backgroundColor: item.trackColor + "30",
              color: "#fff",
              border: `1px solid ${item.trackColor}50`,
            }}
          >
            {item.track}
          </span>

          {item.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.05] text-zinc-300 border border-white/[0.08]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Helper type ─────────────────────────────────────────────────── */
function buildGridItem(t: Talk, trackColor: string, isAttended: boolean) {
  return {
    id: t.id,
    title: t.title,
    speaker: t.speaker?.name ?? "Unknown",
    track: t.track?.name ?? "General",
    trackColor,
    day: `Day ${t.day}`,
    time: `${new Date(t.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(t.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    tags: t.tags,
    isAttended,
    rawTalk: t,
  };
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function SchedulePage() {
  const [talks,       setTalks]       = useState<Talk[]>([]);
  const [tracks,      setTracks]      = useState<Track[]>([]);
  const [_speakers,   _setSpeakers]   = useState<Speaker[]>([]);
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalk,setSelectedTalk]= useState<Talk | null>(null);
  const [toasts,      setToasts]      = useState<ToastMsg[]>([]);
  const [scheduleDay, setScheduleDay] = useState<1 | 2>(1);
  const [filterDay,   setFilterDay]   = useState<0 | 1 | 2>(0); // 0 = all
  const [filterTrack, setFilterTrack] = useState<string>(""); // "" = all
  const toastCounter = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const [resTalks, resAtt] = await Promise.all([
          fetch("/api/talks"),
          fetch("/api/attendance"),
        ]);
        const [dataTalks, dataAtt] = await Promise.all([resTalks.json(), resAtt.json()]);
        if (dataTalks.success) {
          setTalks(dataTalks.talks);
          setTracks(dataTalks.tracks);
          _setSpeakers(dataTalks.speakers);
        }
        if (dataAtt.success) setAttendedIds(dataAtt.attendedTalkIds);
      } catch (e) {
        console.error("Failed to load schedule data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (text: string, type: "add" | "remove") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  };

  const handleToggleAttendance = async (talkId: string, isAttending: boolean) => {
    setAttendedIds((prev) =>
      isAttending ? [...prev, talkId] : prev.filter((id) => id !== talkId)
    );
    const title = talks.find((t) => t.id === talkId)?.title ?? "Session";
    showToast(
      isAttending
        ? `Added: ${title.length > 40 ? title.slice(0, 40) + "…" : title}`
        : `Removed: ${title.length > 40 ? title.slice(0, 40) + "…" : title}`,
      isAttending ? "add" : "remove"
    );
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talkId, attended: isAttending }),
      });
    } catch (e) {
      console.error("Failed to update attendance:", e);
      setAttendedIds((prev) =>
        isAttending ? prev.filter((id) => id !== talkId) : [...prev, talkId]
      );
    }
  };

  /* Track colour lookup */
  const trackColorMap = Object.fromEntries(tracks.map((tr) => [tr.id, tr.color]));

  /* Scheduler data */
  const schedulerData = talks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.abstract,
    start: new Date(t.startTime),
    end: new Date(t.endTime),
    trackId: t.trackId,
  }));

  const resources = [{
    name: "Tracks",
    field: "trackId",
    title: "Track",
    valueField: "value",
    textField: "text",
    data: tracks.map((tr) => ({ text: tr.name, value: tr.id, color: tr.color })),
  }];

  /* Filtered list */
  const filteredItems = talks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.speaker?.name ?? "").toLowerCase().includes(q) ||
        t.abstract.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesDay  = filterDay === 0 || t.day === filterDay;
      const matchesTrack = !filterTrack || t.trackId === filterTrack;
      return matchesSearch && matchesDay && matchesTrack;
    })
    .map((t) => buildGridItem(t, trackColorMap[t.trackId] ?? "#8b5cf6", attendedIds.includes(t.id)));

  const attendingCount = attendedIds.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AttendanceToast toasts={toasts} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-1.5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Calendar className="h-5 w-5" />
              </div>
              Conference Schedule
            </h1>
            <p className="text-sm text-zinc-400">
              Build your personal agenda. Attendance feeds live analytics and AI briefings.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-sm text-zinc-300">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span><RollingNumber value={attendingCount} /> / {talks.length} sessions selected</span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Kendo Scheduler ─────────────────────────────────── */}
            <motion.div
              className="glass-card rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Scheduler header */}
              <div className="px-6 pt-5 pb-4 border-b border-white/[0.05] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">Time Slots</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Color-coded by track — click any session for details</p>
                </div>
                {/* Day switcher */}
                <div className="flex items-center rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60">
                  {([1, 2] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setScheduleDay(d)}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        scheduleDay === d
                          ? "bg-violet-600 text-white"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      Day {d} — Jun {d === 1 ? "12" : "13"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-b-2xl">
                  <Scheduler
                    data={schedulerData}
                    resources={resources}
                    date={scheduleDay === 1 ? new Date("2026-06-12") : new Date("2026-06-13")}
                    defaultView="day"
                    timezone="Etc/UTC"
                    style={{ height: 500 }}
                  >
                    <DayView
                      title={`Day ${scheduleDay} · Jun ${scheduleDay === 1 ? "12" : "13"}`}
                      startTime="09:00"
                      endTime="17:00"
                    />
                    <TimelineView title="Timeline" slotDuration={60} />
                  </Scheduler>
                </div>
            </motion.div>

            {/* ── Session Directory ────────────────────────────────── */}
            <motion.div
              className="glass-card rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              {/* Directory header + filters */}
              <div className="px-6 pt-5 pb-4 border-b border-white/[0.05] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">Session Directory</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {filteredItems.length} session{filteredItems.length !== 1 ? "s" : ""} · {attendingCount} attending
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search sessions, speakers, tags…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-zinc-900/60 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Filter row */}
                <div className="flex flex-wrap gap-2">
                  {/* Day filter */}
                  <div className="flex items-center rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900/60 text-xs font-semibold">
                    {([["All Days", 0], ["Day 1", 1], ["Day 2", 2]] as const).map(([label, val]) => (
                      <button
                        key={val}
                        onClick={() => setFilterDay(val as 0 | 1 | 2)}
                        className={`px-3 py-1.5 transition-colors ${
                          filterDay === val
                            ? "bg-zinc-600 text-white"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Track filter pills */}
                  <button
                    onClick={() => setFilterTrack("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      filterTrack === ""
                        ? "bg-violet-600 text-white border-violet-500"
                        : "text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    All Tracks
                  </button>
                  {tracks.map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => setFilterTrack(filterTrack === tr.id ? "" : tr.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={
                        filterTrack === tr.id
                          ? { backgroundColor: tr.color + "30", color: "#fff", borderColor: tr.color + "60" }
                          : { color: "#a1a1aa", borderColor: "#52525b", backgroundColor: "transparent" }
                      }
                    >
                      {tr.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards list */}
              <div className="p-5 space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-sm text-zinc-500">No sessions match your search</p>
                    <button
                      onClick={() => { setSearchQuery(""); setFilterDay(0); setFilterTrack(""); }}
                      className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {filteredItems.map((item) => (
                        <SessionCard
                          key={item.id}
                          item={item}
                          onSelect={(t) => setSelectedTalk(t)}
                          onToggle={handleToggleAttendance}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

          </div>
        )}
      </main>

      {/* ── Session Detail Dialog ────────────────────────────────── */}
      {selectedTalk && (
        <Dialog
          title="Session Details"
          onClose={() => setSelectedTalk(null)}
          width={500}
        >
          <div className="space-y-5 p-1">
            <h3 className="text-lg font-semibold text-white leading-snug">
              {selectedTalk.title}
            </h3>

            {/* Speaker */}
            <div className="flex items-center gap-3 rounded-xl bg-zinc-900/60 p-3 border border-white/[0.04]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/40 text-violet-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{selectedTalk.speaker?.name}</p>
                <p className="text-xs text-zinc-500">{selectedTalk.speaker?.company ?? "Independent"}</p>
              </div>
            </div>

            {/* Time + Track */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                <span>Day {selectedTalk.day} · {new Date(selectedTalk.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedTalk.track?.color }}
                />
                <span className="truncate">{selectedTalk.track?.name}</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Abstract</p>
              <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                {selectedTalk.abstract}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedTalk.tags.map((tag) => (
                <span key={tag} className="tag-chip flex items-center gap-1">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/[0.05]">
              <button
                onClick={() => {
                  handleToggleAttendance(selectedTalk.id, !attendedIds.includes(selectedTalk.id));
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  attendedIds.includes(selectedTalk.id)
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                    : "bg-violet-600 text-white border-violet-500 hover:bg-violet-500"
                }`}
              >
                {attendedIds.includes(selectedTalk.id) ? (
                  <><Check className="h-4 w-4" />Attending</>
                ) : (
                  <><Plus className="h-4 w-4" />Add to Schedule</>
                )}
              </button>
              <button
                onClick={() => setSelectedTalk(null)}
                className="px-4 py-2 text-sm font-medium bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-700/50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
