"use client";

import { useEffect, useState, useTransition } from "react";
import { Scheduler, DayView, TimelineView } from "@progress/kendo-react-scheduler";
import { Grid, GridColumn, GridCellProps } from "@progress/kendo-react-grid";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Calendar, Search, Tag, User, Clock, Check, Plus, Trash2 } from "lucide-react";
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

  // Load talks, tracks, speakers, and attendance
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

  // Handle toggling attendance
  const handleToggleAttendance = async (talkId: string, isAttending: boolean) => {
    // Optimistic update
    setAttendedIds(prev =>
      isAttending ? [...prev, talkId] : prev.filter(id => id !== talkId)
    );

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talkId, attended: isAttending }),
      });
    } catch (e) {
      console.error("Failed to update attendance on server:", e);
      // Rollback
      setAttendedIds(prev =>
        isAttending ? prev.filter(id => id !== talkId) : [...prev, talkId]
      );
    }
  };

  // Convert DB talks to Scheduler format
  const schedulerData = talks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.abstract,
    start: new Date(t.startTime),
    end: new Date(t.endTime),
    trackId: t.trackId,
  }));

  // Define Scheduler resources for Track color coding
  const resources = [
    {
      name: "Tracks",
      field: "trackId",
      title: "Track",
      valueField: "value",
      textField: "text",
      data: tracks.map(tr => ({
        text: tr.name,
        value: tr.id,
        color: tr.color,
      })),
    },
  ];

  // Grid filter logic
  const filteredGridData = talks
    .filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.speaker?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .map(t => ({
      id: t.id,
      title: t.title,
      speaker: t.speaker?.name || "Unknown",
      track: t.track?.name || "General",
      day: `Day ${t.day}`,
      time: `${new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      tags: t.tags,
      isAttended: attendedIds.includes(t.id),
      rawTalk: t
    }));

  // Grid cells
  const ActionCell = (props: GridCellProps) => {
    const isAttended = props.dataItem.isAttended;
    const talkId = props.dataItem.id;
    return (
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => handleToggleAttendance(talkId, !isAttended)}
          className={`flex items-center gap-1 mx-auto px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
            isAttended
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/25"
              : "bg-zinc-800 text-zinc-300 border-zinc-700/50 hover:bg-violet-600 hover:text-white hover:border-violet-500"
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
              <span>Add to Schedule</span>
            </>
          )}
        </button>
      </td>
    );
  };

  const TitleCell = (props: GridCellProps) => {
    const item = props.dataItem;
    return (
      <td className="px-4 py-3 font-sans">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedTalk(item.rawTalk)}
            className="text-left font-bold text-white hover:text-violet-400 transition leading-snug cursor-pointer"
          >
            {item.title}
          </button>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.tags.map((tag: string) => (
              <span key={tag} className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Calendar className="h-8 w-8 text-violet-400" />
              Conference Scheduler
            </h1>
            <p className="text-sm text-zinc-400">
              Personalize your conference path. Toggling attendance feeds live analytics and AI briefing recommendations.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Attending: <span className="font-semibold text-white">{attendedIds.length}</span> / {talks.length} sessions</span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Kendo Scheduler */}
            <div className="border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-sm overflow-hidden shadow-2xl p-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-zinc-200">Interactive Time Slots</h3>
                <p className="text-xs text-zinc-500">Color-coded by tracks (Track A: React/Core, Track B: Devtools/Performance/AI)</p>
              </div>

              <div className="k-scheduler-dark rounded-xl overflow-hidden">
                <Scheduler
                  data={schedulerData}
                  resources={resources}
                  date={new Date("2026-06-12")}
                  defaultView="day"
                  timezone="Etc/UTC"
                  style={{ height: 500 }}
                >
                  <DayView title="Day 1 (June 12)" startTime="09:00" endTime="17:00" />
                  <TimelineView title="Timeline Flow" slotDuration={60} />
                </Scheduler>
              </div>
            </div>

            {/* Talk Directory Grid */}
            <div className="border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-sm overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-200">Session Directory</h3>
                  <p className="text-xs text-zinc-500">Search and sort across all tracks, tags, and speakers</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search titles, speaker, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Kendo Grid */}
              <Grid
                data={filteredGridData}
                className="k-grid-dark font-sans border-zinc-800 bg-zinc-950 text-zinc-300 text-xs"
                rowHeight={75}
              >
                <GridColumn field="title" title="Session Title" cells={{ data: TitleCell }} width="350px" />
                <GridColumn field="speaker" title="Speaker" width="160px" />
                <GridColumn field="track" title="Track Resource" width="200px" />
                <GridColumn field="time" title="Scheduled Slot" width="180px" />
                <GridColumn field="action" title="Attendance" cells={{ data: ActionCell }} width="160px" />
              </Grid>
            </div>
          </div>
        )}
      </main>

      {/* Kendo Dialog for Selected Session details */}
      {selectedTalk && (
        <Dialog title="Session Details" onClose={() => setSelectedTalk(null)} width={480}>
          <div className="space-y-4 text-zinc-300 font-sans p-2">
            <h4 className="text-lg font-bold text-white leading-snug">{selectedTalk.title}</h4>
            
            {/* Speaker block */}
            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/40 text-violet-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-100">{selectedTalk.speaker?.name}</div>
                <div className="text-xs text-zinc-400">{selectedTalk.speaker?.company || "Independent"}</div>
              </div>
            </div>

            {/* Time & Track details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>Day {selectedTalk.day} • {new Date(selectedTalk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedTalk.track?.color }}></span>
                <span className="truncate">{selectedTalk.track?.name}</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Abstract</div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
                {selectedTalk.abstract}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedTalk.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/50">
                  <Tag className="h-2.5 w-2.5 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              {/* Toggle in Dialog */}
              <button
                onClick={() => {
                  const isCurrentlyAttending = attendedIds.includes(selectedTalk.id);
                  handleToggleAttendance(selectedTalk.id, !isCurrentlyAttending);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  attendedIds.includes(selectedTalk.id)
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/25"
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
                className="px-4 py-1.5 text-xs font-semibold bg-zinc-850 hover:bg-zinc-850 text-zinc-400 rounded-lg border border-zinc-800 transition"
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
