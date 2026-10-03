import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  RotateCcw, 
  Search, 
  MapPin, 
  User, 
  Layers, 
  Check, 
  X, 
  AlertTriangle,
  Upload,
  ExternalLink,
  Sparkles,
  Heart,
  Save
} from 'lucide-react';
import type { Place, Programme, SectorId, Story } from '../data/types';
import { SECTORS, SECTOR_ORDER } from '../data/sectors';
import { 
  loadAdminStories, 
  saveAdminStories, 
  loadAdminPlaces, 
  saveAdminPlaces, 
  loadAdminProgrammes, 
  saveAdminProgrammes, 
  resetAdminDataToDefaults, 
  hasCustomAdminChanges, 
  downloadJsonFile 
} from '../data/DataManager';
import countiesGeo from '../data/geo/counties.json';
import { cn } from '../utils/cn';

interface Props {
  onGoToMap: () => void;
}

export default function AdminDashboard({ onGoToMap }: Props) {
  const [activeTab, setActiveTab] = useState<'stories' | 'places' | 'programmes'>('stories');
  
  // Data state
  const [stories, setStories] = useState<Story[]>(() => loadAdminStories());
  const [places, setPlaces] = useState<Place[]>(() => loadAdminPlaces());
  const [programmes, setProgrammes] = useState<Programme[]>(() => loadAdminProgrammes());
  const [hasCustom, setHasCustom] = useState(() => hasCustomAdminChanges());

  // Search & filter states
  const [storySearch, setStorySearch] = useState('');
  const [storySectorFilter, setStorySectorFilter] = useState<SectorId | 'all'>('all');
  const [placeSearch, setPlaceSearch] = useState('');

  // Modals state
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [editingProg, setEditingProg] = useState<Programme | null>(null);
  const [isAddingProg, setIsAddingProg] = useState(false);

  // Success notifications
  const [notification, setNotification] = useState<string | null>(null);
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --- STORY ACTIONS ---
  const handleSaveStory = (storyData: Story) => {
    let updated: Story[];
    if (editingStory) {
      updated = stories.map(s => s.id === storyData.id ? storyData : s);
      notify(`Updated persona: ${storyData.name}`);
    } else {
      updated = [storyData, ...stories];
      notify(`Created new persona: ${storyData.name}`);
    }
    setStories(updated);
    saveAdminStories(updated);
    setHasCustom(true);
    setEditingStory(null);
    setIsAddingStory(false);
  };

  const handleDeleteStory = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = stories.filter(s => s.id !== id);
    setStories(updated);
    saveAdminStories(updated);
    setHasCustom(true);
    notify(`Deleted persona: ${name}`);
  };

  // --- PLACE ACTIONS ---
  const handleSavePlace = (placeData: Place) => {
    let updated: Place[];
    if (editingPlace) {
      updated = places.map(p => p.id === placeData.id ? placeData : p);
      notify(`Updated location: ${placeData.name}`);
    } else {
      updated = [...places, placeData];
      notify(`Added new location: ${placeData.name}`);
    }
    setPlaces(updated);
    saveAdminPlaces(updated);
    setHasCustom(true);
    setEditingPlace(null);
    setIsAddingPlace(false);
  };

  const handleDeletePlace = (id: string, name: string) => {
    if (stories.some(s => s.locationId === id)) {
      alert(`Cannot delete ${name} because there are active personas registered to this location. Please reassign or delete those personas first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = places.filter(p => p.id !== id);
    setPlaces(updated);
    saveAdminPlaces(updated);
    setHasCustom(true);
    notify(`Deleted location: ${name}`);
  };

  // --- PROGRAMME ACTIONS ---
  const handleSaveProg = (progData: Programme) => {
    let updated: Programme[];
    if (editingProg) {
      updated = programmes.map(p => p.id === progData.id ? progData : p);
      notify(`Updated programme: ${progData.name}`);
    } else {
      updated = [...programmes, progData];
      notify(`Added new programme: ${progData.name}`);
    }
    setProgrammes(updated);
    saveAdminProgrammes(updated);
    setHasCustom(true);
    setEditingProg(null);
    setIsAddingProg(false);
  };

  const handleResetDefaults = () => {
    if (!window.confirm("Are you sure you want to reset all data back to the built-in system defaults? Any custom additions or edits in your browser will be cleared.")) return;
    resetAdminDataToDefaults();
    setStories(loadAdminStories());
    setPlaces(loadAdminPlaces());
    setProgrammes(loadAdminProgrammes());
    setHasCustom(false);
    notify("Reset all content back to system defaults!");
  };

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchSector = storySectorFilter === 'all' || s.sectors.includes(storySectorFilter);
      const place = places.find(p => p.id === s.locationId);
      const q = storySearch.toLowerCase();
      const matchQuery = !q || 
        s.name.toLowerCase().includes(q) || 
        s.role.toLowerCase().includes(q) || 
        (place?.name || '').toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q);
      return matchSector && matchQuery;
    });
  }, [stories, storySectorFilter, storySearch, places]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      const q = placeSearch.toLowerCase();
      return !q || 
        p.name.toLowerCase().includes(q) || 
        p.county.toLowerCase().includes(q) || 
        p.state.toLowerCase().includes(q) ||
        (p.subCounties || []).some(sc => sc.toLowerCase().includes(q));
    });
  }, [places, placeSearch]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#008751] px-5 py-3 text-sm font-bold text-white shadow-2xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="rounded-3xl border border-outline-variant/40 bg-gradient-to-br from-[#008751]/15 via-surface-container-lowest to-[#008751]/5 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#008751]/15 px-3 py-1 text-xs font-bold text-[#008751]">
              <Shield className="h-3.5 w-3.5" />
              <span>PRDA Content Management Portal</span>
              {hasCustom && (
                <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-800 font-extrabold">
                  Custom Changes Active
                </span>
              )}
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
              Live Content Administration
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl">
              Add, modify, or reassign field champions, midwives, relief activities, and sub-county payams. All edits are saved immediately and reflect live across the map and views.
            </p>
          </div>

          {/* Quick Actions / Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadJsonFile('stories.json', stories)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
              title="Download clean stories.json"
            >
              <Download className="h-3.5 w-3.5 text-[#008751]" />
              <span>Export Stories</span>
            </button>
            <button
              type="button"
              onClick={() => downloadJsonFile('locations.json', places)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
              title="Download clean locations.json"
            >
              <Download className="h-3.5 w-3.5 text-[#008751]" />
              <span>Export Places</span>
            </button>
            <button
              type="button"
              onClick={() => downloadJsonFile('programmes.json', programmes)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
              title="Download clean programmes.json"
            >
              <Download className="h-3.5 w-3.5 text-[#008751]" />
              <span>Export Programmes</span>
            </button>
            {hasCustom && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                title="Revert back to built-in system defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-t border-outline-variant/30 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('stories')}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs",
              activeTab === 'stories' 
                ? "bg-[#008751] text-white ring-2 ring-[#008751]/30" 
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
            )}
          >
            <User className="h-4 w-4" />
            <span>Field Personas & Stories</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">{stories.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('places')}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs",
              activeTab === 'places' 
                ? "bg-[#008751] text-white ring-2 ring-[#008751]/30" 
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
            )}
          >
            <MapPin className="h-4 w-4" />
            <span>Places & Sub-Counties</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">{places.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('programmes')}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs",
              activeTab === 'programmes' 
                ? "bg-[#008751] text-white ring-2 ring-[#008751]/30" 
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Programmes</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">{programmes.length}</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: PERSONAS & STORIES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStorySectorFilter('all')}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                  storySectorFilter === 'all'
                    ? "bg-[#008751] text-white"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40"
                )}
              >
                All Sectors ({stories.length})
              </button>
              {SECTOR_ORDER.map(s => {
                const count = stories.filter(x => x.sectors.includes(s)).length;
                if (!count) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStorySectorFilter(s)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                      storySectorFilter === s
                        ? "text-white"
                        : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40"
                    )}
                    style={storySectorFilter === s ? { backgroundColor: SECTORS[s].color } : {}}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SECTORS[s].color }} />
                    {SECTORS[s].short} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={storySearch}
                  onChange={e => setStorySearch(e.target.value)}
                  placeholder="Search personas..."
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest py-2 pl-9 pr-3 text-xs text-on-surface focus:border-[#008751] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStory(null);
                  setIsAddingStory(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-4 py-2 text-xs font-bold text-white hover:bg-[#007043] transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Add Persona</span>
              </button>
            </div>
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map(story => {
              const place = places.find(p => p.id === story.locationId);
              return (
                <div
                  key={story.id}
                  className="flex flex-col justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-xs hover:border-[#008751]/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container">
                        {story.portrait ? (
                          <img src={story.portrait.src} alt={story.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-on-surface-variant">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-headline text-base font-bold text-on-surface truncate">{story.name}</h3>
                          <span className={cn(
                            "rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase",
                            story.status === 'published' ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                          )}>
                            {story.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">{story.role}</p>
                        <p className="text-[11px] font-semibold text-[#008751] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {place?.name || story.locationId} ({place?.county || 'South Sudan'})
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface line-clamp-2 italic">
                      "{story.quote || story.headline}"
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {story.sectors.map(s => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: SECTORS[s].color }}>
                          {SECTORS[s].short}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant font-mono">ID: {story.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStory(story);
                          setIsAddingStory(true);
                        }}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-[#008751] transition-colors"
                        title="Edit persona"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStory(story.id, story.name)}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete persona"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: PLACES & SUB-COUNTIES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
              <input
                type="text"
                value={placeSearch}
                onChange={e => setPlaceSearch(e.target.value)}
                placeholder="Search places or payams..."
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest py-2 pl-9 pr-3 text-xs text-on-surface focus:border-[#008751] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPlace(null);
                setIsAddingPlace(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-4 py-2 text-xs font-bold text-white hover:bg-[#007043] transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map(place => {
              const placeStories = stories.filter(s => s.locationId === place.id);
              return (
                <div
                  key={place.id}
                  className="flex flex-col justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-xs hover:border-[#008751]/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">{place.name}</h3>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {place.county} County • {place.state}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#008751]/15 px-2 py-0.5 text-[10px] font-bold text-[#008751]">
                        {placeStories.length} {placeStories.length === 1 ? 'person' : 'people'}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {place.summary}
                    </p>

                    {/* Sub-counties / Payams tags */}
                    {place.subCounties && place.subCounties.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          Payams & Sub-Counties ({place.subCounties.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {place.subCounties.map(sub => (
                            <span key={sub} className="rounded-md border border-outline-variant/40 bg-surface-container-low px-1.5 py-0.5 text-[10px] font-medium text-on-surface">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] font-mono text-on-surface-variant">
                      Coords: [{place.coords[0].toFixed(3)}, {place.coords[1].toFixed(3)}]
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant font-mono">ID: {place.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlace(place);
                          setIsAddingPlace(true);
                        }}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-[#008751] transition-colors"
                        title="Edit location"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place.id, place.name)}
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete location"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: PROGRAMMES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'programmes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Manage PRDA relief, health, education, and development programmes active across South Sudan.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingProg(null);
                setIsAddingProg(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-4 py-2 text-xs font-bold text-white hover:bg-[#007043] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Programme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programmes.map(prog => (
              <div
                key={prog.id}
                className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-headline text-base font-bold text-on-surface">{prog.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prog.sectors.map(s => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: SECTORS[s].color }}>
                          {SECTORS[s].short}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                    prog.status === 'active' ? "bg-emerald-500/15 text-emerald-700" : "bg-surface-container text-on-surface-variant"
                  )}>
                    {prog.status}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {prog.summary}
                </p>

                <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Active in <strong>{prog.locationIds.length}</strong> centres</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProg(prog);
                      setIsAddingProg(true);
                    }}
                    className="inline-flex items-center gap-1 font-bold text-[#008751] hover:underline"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PERSONA */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isAddingStory && (
        <StoryEditModal
          story={editingStory}
          places={places}
          programmes={programmes}
          onSave={handleSaveStory}
          onClose={() => {
            setEditingStory(null);
            setIsAddingStory(false);
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT LOCATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isAddingPlace && (
        <PlaceEditModal
          place={editingPlace}
          programmes={programmes}
          onSave={handleSavePlace}
          onClose={() => {
            setEditingPlace(null);
            setIsAddingPlace(false);
          }}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PROGRAMME */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isAddingProg && (
        <ProgEditModal
          prog={editingProg}
          places={places}
          onSave={handleSaveProg}
          onClose={() => {
            setEditingProg(null);
            setIsAddingProg(false);
          }}
        />
      )}
    </div>
  );
}

// ─── STORY MODAL COMPONENT ──────────────────────────────────────────
function StoryEditModal({ story, places, programmes, onSave, onClose }: {
  story: Story | null;
  places: Place[];
  programmes: Programme[];
  onSave: (s: Story) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(story?.name || '');
  const [role, setRole] = useState(story?.role || '');
  const [locationId, setLocationId] = useState(story?.locationId || places[0]?.id || 'juba');
  const [selectedSectors, setSelectedSectors] = useState<SectorId[]>(story?.sectors || ['health']);
  const [selectedProgs, setSelectedProgs] = useState<string[]>(story?.programmeIds || ['phsi']);
  const [headline, setHeadline] = useState(story?.headline || '');
  const [quote, setQuote] = useState(story?.quote || '');
  const [portraitSrc, setPortraitSrc] = useState(story?.portrait?.src || 'media/people/nyakim-midwife.jpg');
  const [status, setStatus] = useState<Story['status']>(story?.status || 'draft');
  const [before, setBefore] = useState(story?.chapters.before || '');
  const [supported, setSupported] = useState(story?.chapters.supported || '');
  const [changed, setChanged] = useState(story?.chapters.changed || '');

  const toggleSector = (sec: SectorId) => {
    setSelectedSectors(prev => 
      prev.includes(sec) ? (prev.length > 1 ? prev.filter(x => x !== sec) : prev) : [...prev, sec]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert("Name and role are required.");
      return;
    }

    const id = story?.id || `${locationId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const newStory: Story = {
      id,
      status,
      name: name.trim(),
      role: role.trim(),
      locationId,
      programmeIds: selectedProgs,
      sectors: selectedSectors,
      headline: headline.trim() || `${name} delivers vital services in ${locationId}.`,
      portrait: portraitSrc ? { src: portraitSrc.trim(), alt: `Portrait of ${name}`, credit: "Photo: PRDA Field Work" } : null,
      video: story?.video || null,
      quote: quote.trim() || null,
      chapters: {
        before: before.trim() || "Before intervention, community members faced major barriers to accessing basic services.",
        supported: supported.trim() || "Through PRDA programmes, essential training, materials, and support were established.",
        changed: changed.trim() || "Today community members benefit from resilient, sustained local support."
      },
      support: story?.support || [{ label: "Direct Programme Assistance", detail: "Community-based support and supplies" }],
      impact: story?.impact || [{ label: "Beneficiaries reached", value: 150, unit: "people", evidence: { type: "record", note: "Field register", sourceId: null } }],
      consent: story?.consent || { obtained: false, date: null, scope: null },
      recordedBy: "PRDA Admin Portal",
      recordedOn: new Date().toISOString().split('T')[0],
      relatedStoryIds: story?.relatedStoryIds || []
    };

    onSave(newStory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-2xl border border-outline-variant/40 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {story ? `Edit Persona: ${story.name}` : 'Add New Field Persona'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Veronica Nyakuoth"
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Role / Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Midwife, Ulang PHCC"
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Location / Centre</label>
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              >
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.county} County)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Publishing Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              >
                <option value="draft">Draft (Field review)</option>
                <option value="published">Published (Consented)</option>
                <option value="test">Test Persona</option>
              </select>
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-1.5">
            <label className="font-bold text-on-surface">Program Sectors</label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_ORDER.map(s => {
                const active = selectedSectors.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSector(s)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      active ? "text-white shadow-xs" : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40"
                    )}
                    style={active ? { backgroundColor: SECTORS[s].color } : {}}
                  >
                    {SECTORS[s].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline & Quote */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Story Headline</label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="One powerful sentence summarizing their impact..."
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Personal Quote</label>
            <textarea
              rows={2}
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="In their own words..."
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          {/* Story Narrative Chapters */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/30">
            <span className="font-bold text-on-surface block text-xs">Story Narrative Chapters</span>
            <div className="space-y-2">
              <textarea
                rows={2}
                value={before}
                onChange={e => setBefore(e.target.value)}
                placeholder="Chapter 1 (Before): Life and community challenges before intervention..."
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2 text-on-surface outline-none focus:border-[#008751]"
              />
              <textarea
                rows={2}
                value={supported}
                onChange={e => setSupported(e.target.value)}
                placeholder="Chapter 2 (How PRDA Helped): Training, equipment, kits, or assistance provided..."
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2 text-on-surface outline-none focus:border-[#008751]"
              />
              <textarea
                rows={2}
                value={changed}
                onChange={e => setChanged(e.target.value)}
                placeholder="Chapter 3 (What Changed): Lasting impact, lives saved, and current status..."
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          {/* Portrait URL */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Portrait Photo Path</label>
            <input
              type="text"
              value={portraitSrc}
              onChange={e => setPortraitSrc(e.target.value)}
              placeholder="e.g. media/people/nyakim-midwife.jpg"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#007043]"
            >
              <Save className="h-4 w-4" />
              <span>Save Persona</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PLACE MODAL COMPONENT ──────────────────────────────────────────
function PlaceEditModal({ place, programmes, onSave, onClose }: {
  place: Place | null;
  programmes: Programme[];
  onSave: (p: Place) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(place?.name || '');
  const [county, setCounty] = useState(place?.county || 'Juba');
  const [state, setState] = useState(place?.state || 'Central Equatoria');
  const [lat, setLat] = useState(place?.coords[0] || 4.85);
  const [lng, setLng] = useState(place?.coords[1] || 31.58);
  const [summary, setSummary] = useState(place?.summary || '');
  const [subCountiesText, setSubCountiesText] = useState((place?.subCounties || []).join(', '));
  const [selectedProgs, setSelectedProgs] = useState<string[]>(place?.programmeIds || ['phsi']);

  const allCountyNames = useMemo(() => {
    return Array.from(new Set(countiesGeo.features.map(f => f.properties.name))).sort();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = place?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const subCounties = subCountiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newPlace: Place = {
      id,
      name: name.trim(),
      county,
      state: state.trim(),
      coords: [Number(lat), Number(lng)],
      coordsPrecision: place?.coordsPrecision || 'town',
      labelSide: place?.labelSide || 'right',
      summary: summary.trim() || `PRDA humanitarian relief and development work in ${name}.`,
      programmeIds: selectedProgs,
      subCounties: subCounties.length ? subCounties : undefined,
      notes: place?.notes || [],
      sourceIds: place?.sourceIds || ['prda-about', 'prda-field-records']
    };

    onSave(newPlace);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-2xl border border-outline-variant/40 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {place ? `Edit Location: ${place.name}` : 'Add New Location / Centre'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Location / Centre Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Abyei or Mandeang"
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-on-surface">County</label>
              <select
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              >
                {allCountyNames.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">State / Administrative Area</label>
            <input
              type="text"
              required
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="e.g. Upper Nile or Jonglei"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Latitude</label>
              <input
                type="number"
                step="0.001"
                required
                value={lat}
                onChange={e => setLat(Number(e.target.value))}
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Longitude</label>
              <input
                type="number"
                step="0.001"
                required
                value={lng}
                onChange={e => setLng(Number(e.target.value))}
                className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Sub-Counties / Payams (Comma Separated)</label>
            <input
              type="text"
              value={subCountiesText}
              onChange={e => setSubCountiesText(e.target.value)}
              placeholder="e.g. Town Centre, Agok, Alal, Mijak, Rumamer"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Location Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Overview of PRDA's presence and activities here..."
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#007043]"
            >
              <Save className="h-4 w-4" />
              <span>Save Location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PROGRAMME MODAL COMPONENT ──────────────────────────────────────
function ProgEditModal({ prog, places, onSave, onClose }: {
  prog: Programme | null;
  places: Place[];
  onSave: (p: Programme) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(prog?.name || '');
  const [summary, setSummary] = useState(prog?.summary || '');
  const [selectedSectors, setSelectedSectors] = useState<SectorId[]>(prog?.sectors || ['health']);
  const [partnersText, setPartnersText] = useState((prog?.partners || []).join(', '));
  const [status, setStatus] = useState<Programme['status']>(prog?.status || 'active');

  const toggleSector = (sec: SectorId) => {
    setSelectedSectors(prev => 
      prev.includes(sec) ? (prev.length > 1 ? prev.filter(x => x !== sec) : prev) : [...prev, sec]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = prog?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const partners = partnersText.split(',').map(p => p.trim()).filter(Boolean);

    const newProg: Programme = {
      id,
      name: name.trim(),
      summary: summary.trim(),
      sectors: selectedSectors,
      years: prog?.years || { start: 2024, end: null },
      status,
      partners,
      locationIds: prog?.locationIds || [],
      facts: prog?.facts || [],
      sourceIds: prog?.sourceIds || ['prda-about', 'prda-field-records']
    };

    onSave(newProg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-2xl border border-outline-variant/40 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {prog ? `Edit Programme: ${prog.name}` : 'Add New Programme'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Programme Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Community Medical Camps & Mobile Outreach"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-on-surface">Sectors</label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_ORDER.map(s => {
                const active = selectedSectors.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSector(s)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                      active ? "text-white shadow-xs" : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40"
                    )}
                    style={active ? { backgroundColor: SECTORS[s].color } : {}}
                  >
                    {SECTORS[s].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Partners (Comma Separated)</label>
            <input
              type="text"
              value={partnersText}
              onChange={e => setPartnersText(e.target.value)}
              placeholder="e.g. PCOSS, Mission 21, ACT Alliance"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-on-surface">Summary Description</label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Describe programme goals, interventions, and community impact..."
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low p-2.5 text-on-surface outline-none focus:border-[#008751]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#007043]"
            >
              <Save className="h-4 w-4" />
              <span>Save Programme</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
