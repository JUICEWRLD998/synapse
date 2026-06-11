"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Scheduler,
  DayView,
  TimelineView,
} from "@progress/kendo-react-scheduler";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Calendar,
  Search,
  Tag,
  User,
  Clock,
  Check,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import { Talk, Track, Speaker } from "@/types";

export default function SchedulePage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null);
  const [, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const resTalks = await fetch("/api/talks");
      const dataTalks = await resTalks.json();
      if (dataTalks.success) {
        setTalks(dataTalks.talks);
        setTracks(dataTalks.tracks);
        setSpeakers(dataTalks.speakers);
      }

      const resAttendance = await fetch("/api/attendance");
      const dataAttendance = await resAttendance.json();
      if (dataAttendance.success) {
        setAttendedIds(dataAttendance.attendedTalkIds);
      }
    } catch (e) {
      console.error("Failed to load page data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAttendance = async (
    talkId: string,
    isAttending: boolean
  ) => {
    setAttendedIds((prev) =>
      isAttending ? [...prev, talkId] : prev.filter((id) => id !== talkId)
    );

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talkId, attended: isAttending }),
      });
    } catch (e) {
      console.error("Failed to update attendance on server:", e);
      setAttendedIds((prev) =>
        isAttending ? prev.filter((id) => id !== talkId) : [...prev, talkId]
      );
    }
  };

  const schedulerData = talks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.abstract,
    start: new Date(t.startTime),
    end: new Date(t.endTime),
    trackId: t.trackId,
  }));

  const resources = [
    {
      name: "Tracks",
      field: "trackId",
      title: "Track",
      valueField: "value",
      textField: "text",
      data: tracks.map((tr) => ({
        text: tr.name,
        value: tr.id,
        color: tr.color,
      })),
    },
  ];

  const filteredGridData = talks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.speaker?.name.toLowerCase().includes(q) ||
        t.abstract.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .map((t) => ({
      id: t.id,
      title: t.title,
      speaker: t.speaker?.name || "Unknown",
      track: t.track?.name || "General",
      day: `Day ${t.day}`,
      time: `${new Date(t.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(t.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      tags: t.tags,
      isAttended: attendedIds.includes(t.id),
      rawTalk: t,
    }));

  const ActionCell = (props: GridCellProps) => {
    const isAttended = props.dataItem.isAttended;
    const talkId = props.dataItem.id;
    return (
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => handleToggleAttendance(talkId, !isAttended)}
          className={`flex items-center gap-1 mx-auto px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border transition-all ${
            isAttended
              ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/15 hover:bg-rose-500/8 hover:text-rose-400 hover:border-rose-500/15"
              : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-violet-600 hover:text-white hover:border-violet-500"
          }`}
        >
          {isAttended ? (
            <>
              <Check className="h-3 w-3" />
              <span>Attending</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </>
          )}
        </button>
      </td>
    );
  };

  const TitleCell = (props: GridCellProps) => {
    const item = props.dataItem;
    return (
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedTalk(item.rawTalk)}
            className="text-left font-medium text-zinc-100 hover:text-violet-400 transition leading-snug cursor-pointer text-sm"
          >
            {item.title}
          </button>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-[9px] bg-white/[0.03] text-zinc-500 px-1.5 py-0.5 rounded border border-white/[0.04]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                <Calendar className="h-4 w-4" />
              </div>
              Conference Scheduler
            </h1>
            <p className="text-sm text-zinc-400">
              Personalize your conference path. Toggling attendance feeds live
              analytics and AI briefings.
            </p>
          </div>

          <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-zinc-300">
              <span className="font-semibold text-white">
                {attendedIds.length}
              </span>{" "}
              / {talks.length} sessions
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-zinc-800 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Kendo Scheduler */}
            <motion.div
              className="glass-card rounded-2xl overflow-hidden p-5 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Interactive Time Slots
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Color-coded by track. Click sessions for details.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden">
                <Scheduler
                  data={schedulerData}
                  resources={resources}
                  date={new Date("2026-06-12")}
                  defaultView="day"
                  timezone="Etc/UTC"
                  style={{ height: 480 }}
                >
                  <DayView
                    title="Day 1 (June 12)"
                    startTime="09:00"
                    endTime="17:00"
                  />
                  <TimelineView title="Timeline Flow" slotDuration={60} />
                </Scheduler>
              </div>
            </motion.div>

            {/* Session Directory Grid */}
            <motion.div
              className="glass-card rounded-2xl overflow-hidden p-5 sm:p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Session Directory
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Search and sort across all tracks, tags, and speakers
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>

              <Grid
                data={filteredGridData}
                className="k-grid-dark text-xs"
                rowHeight={72}
              >
                <GridColumn
                  field="title"
                  title="Session Title"
                  cells={{ data: TitleCell }}
                  width="340px"
                />
                <GridColumn
                  field="speaker"
                  title="Speaker"
                  width="150px"
                />
                <GridColumn
                  field="track"
                  title="Track"
                  width="200px"
                />
                <GridColumn
                  field="time"
                  title="Time"
                  width="170px"
                />
                <GridColumn
                  field="action"
                  title="Status"
                  cells={{ data: ActionCell }}
                  width="130px"
                />
              </Grid>
            </motion.div>
          </div>
        )}
      </main>

      {/* Kendo Dialog — Session Details */}
      {selectedTalk && (
        <Dialog
          title="Session Details"
          onClose={() => setSelectedTalk(null)}
          width={480}
        >
          <div className="space-y-4 text-zinc-300 p-1">
            <h4 className="text-lg font-semibold text-white leading-snug">
              {selectedTalk.title}
            </h4>

            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-white/[0.04]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-900/40 text-violet-300">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-zinc-100 text-sm">
                  {selectedTalk.speaker?.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {selectedTalk.speaker?.company || "Independent"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>
                  Day {selectedTalk.day} &middot;{" "}
                  {new Date(selectedTalk.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: selectedTalk.track?.color }}
                />
                <span className="truncate">{selectedTalk.track?.name}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Abstract
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                {selectedTalk.abstract}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedTalk.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] font-medium bg-white/[0.04] text-zinc-400 px-2 py-0.5 rounded border border-white/[0.06]"
                >
                  <Tag className="h-2.5 w-2.5 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
              <button
                onClick={() => {
                  const isAttending = attendedIds.includes(selectedTalk.id);
                  handleToggleAttendance(selectedTalk.id, !isAttending);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  attendedIds.includes(selectedTalk.id)
                    ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/15 hover:bg-rose-500/8 hover:text-rose-400 hover:border-rose-500/15"
                    : "bg-violet-600 text-white border-violet-500 hover:bg-violet-500"
                }`}
              >
                {attendedIds.includes(selectedTalk.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Attending</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Schedule</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedTalk(null)}
                className="px-4 py-1.5 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 rounded-lg border border-white/[0.06] transition"
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
