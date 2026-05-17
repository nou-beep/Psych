"use client";
// State for the Client Portal experience: emotional weather, low-energy
// mode, theme, check-ins, comfort objects, safe people, journey progress,
// expression canvases, favourite cards. Persisted to localStorage so the
// portal remembers across sessions on the same device.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage, generateId, nowISO } from "@/lib/store";
import {
  CLIENT_STORE_KEYS,
} from "@/lib/client/portal-store";
import type { EmotionalWeather } from "@/lib/client/emotional-weather";
import type {
  JourneyId,
  JourneyProgress,
} from "@/lib/client/journeys";
import { markStepComplete, resetJourney } from "@/lib/client/journeys";

export type ClientTheme =
  | "moonlight"
  | "rose-calm"
  | "ocean-quiet"
  | "lavender-rest"
  | "golden-hour"
  | "cloud-room";

export type CheckInMode = "expressive" | "minimal" | "silent" | "low-energy";

export interface ClientCheckIn {
  id: string;
  date: string;
  prompt: string;
  text?: string;
  weather?: EmotionalWeather | null;
  audioId?: string;
  mode: CheckInMode;
  createdAt: string;
}

export interface ComfortObject {
  id: string;
  kind: "quote" | "image" | "color" | "memory" | "reminder";
  body: string;
  hint?: string;
  collection?: string;
  createdAt: string;
}

export interface SafePerson {
  id: string;
  name: string;
  role?: string;
  reminder?: string;
  createdAt: string;
}

export interface ExpressionCanvas {
  id: string;
  // Stored as JSON shape descriptors so we can render later. Each entry
  // is one circle / blob with a position, size, color, and intensity.
  blobs: Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    intensity: number;
  }>;
  note?: string;
  weather?: EmotionalWeather | null;
  createdAt: string;
}

export interface ClientAudio {
  id: string;
  name: string;
  durationSeconds?: number;
  transcript?: string;
  weather?: EmotionalWeather | null;
  createdAt: string;
}

interface ClientState {
  weather: EmotionalWeather | null;
  theme: ClientTheme;
  lowEnergyMode: boolean;
  crisisModeActive: boolean;
  aftercareActive: boolean;
  audioReflectionCount: number;
  groundingUses: number;
  lowEnergySessionCount: number;
}

const DEFAULT_STATE: ClientState = {
  weather: null,
  theme: "rose-calm",
  lowEnergyMode: false,
  crisisModeActive: false,
  aftercareActive: false,
  audioReflectionCount: 0,
  groundingUses: 0,
  lowEnergySessionCount: 0,
};

interface ClientPortalContextType {
  // Core state
  weather: EmotionalWeather | null;
  theme: ClientTheme;
  lowEnergyMode: boolean;
  crisisModeActive: boolean;
  aftercareActive: boolean;
  weatherHistory: EmotionalWeather[];

  // Counters used by therapy memory
  audioReflectionCount: number;
  groundingUses: number;
  lowEnergySessionCount: number;

  // Persistent collections
  checkIns: ClientCheckIn[];
  comfortObjects: ComfortObject[];
  safePeople: SafePerson[];
  favouriteCardIds: string[];
  journeyProgress: Record<JourneyId, JourneyProgress | undefined>;
  expressions: ExpressionCanvas[];
  clientAudio: ClientAudio[];

  // Setters
  setWeather: (w: EmotionalWeather | null) => void;
  setTheme: (t: ClientTheme) => void;
  setLowEnergyMode: (on: boolean) => void;
  activateCrisis: () => void;
  exitCrisis: () => void;
  startAftercare: () => void;
  endAftercare: () => void;
  incrementGroundingUse: () => void;

  // Collection ops
  addCheckIn: (data: Partial<ClientCheckIn>) => ClientCheckIn;
  deleteCheckIn: (id: string) => void;

  addComfortObject: (data: Partial<ComfortObject>) => ComfortObject;
  deleteComfortObject: (id: string) => void;
  reorderComfortObjects: (orderedIds: string[]) => void;

  addSafePerson: (data: Partial<SafePerson>) => SafePerson;
  updateSafePerson: (id: string, data: Partial<SafePerson>) => void;
  deleteSafePerson: (id: string) => void;

  toggleFavouriteCard: (cardId: string) => void;

  completeJourneyStep: (journeyId: JourneyId, stepId: string) => void;
  resetJourneyProgress: (journeyId: JourneyId) => void;

  addExpression: (data: Partial<ExpressionCanvas>) => ExpressionCanvas;
  deleteExpression: (id: string) => void;

  addClientAudio: (data: Partial<ClientAudio>) => ClientAudio;
  deleteClientAudio: (id: string) => void;
}

const ClientPortalContext = createContext<ClientPortalContextType | null>(null);

export function ClientPortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClientState>(DEFAULT_STATE);
  const [weatherHistory, setWeatherHistory] = useState<EmotionalWeather[]>([]);
  const [checkIns, setCheckIns] = useState<ClientCheckIn[]>([]);
  const [comfortObjects, setComfortObjects] = useState<ComfortObject[]>([]);
  const [safePeople, setSafePeople] = useState<SafePerson[]>([]);
  const [favouriteCardIds, setFavouriteCardIds] = useState<string[]>([]);
  const [journeyProgress, setJourneyProgress] = useState<
    Record<string, JourneyProgress | undefined>
  >({});
  const [expressions, setExpressions] = useState<ExpressionCanvas[]>([]);
  const [clientAudio, setClientAudio] = useState<ClientAudio[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate.
  useEffect(() => {
    setState(loadFromStorage(CLIENT_STORE_KEYS.CLIENT_STATE, DEFAULT_STATE));
    setWeatherHistory(
      loadFromStorage<EmotionalWeather[]>(CLIENT_STORE_KEYS.WEATHER_HISTORY, [])
    );
    setCheckIns(loadFromStorage<ClientCheckIn[]>(CLIENT_STORE_KEYS.CHECK_INS, []));
    setComfortObjects(
      loadFromStorage<ComfortObject[]>(CLIENT_STORE_KEYS.COMFORT_OBJECTS, [])
    );
    setSafePeople(
      loadFromStorage<SafePerson[]>(CLIENT_STORE_KEYS.SAFE_PEOPLE, [])
    );
    setFavouriteCardIds(
      loadFromStorage<string[]>(CLIENT_STORE_KEYS.FAVOURITE_CARDS, [])
    );
    setJourneyProgress(
      loadFromStorage<Record<string, JourneyProgress | undefined>>(
        CLIENT_STORE_KEYS.JOURNEY_PROGRESS,
        {}
      )
    );
    setExpressions(
      loadFromStorage<ExpressionCanvas[]>(
        CLIENT_STORE_KEYS.EXPRESSION_CANVASES,
        []
      )
    );
    setClientAudio(
      loadFromStorage<ClientAudio[]>(CLIENT_STORE_KEYS.CLIENT_AUDIO, [])
    );
    setReady(true);
  }, []);

  // Persist.
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.CLIENT_STATE, state);
  }, [state, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.WEATHER_HISTORY, weatherHistory);
  }, [weatherHistory, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.CHECK_INS, checkIns);
  }, [checkIns, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.COMFORT_OBJECTS, comfortObjects);
  }, [comfortObjects, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.SAFE_PEOPLE, safePeople);
  }, [safePeople, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.FAVOURITE_CARDS, favouriteCardIds);
  }, [favouriteCardIds, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.JOURNEY_PROGRESS, journeyProgress);
  }, [journeyProgress, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.EXPRESSION_CANVASES, expressions);
  }, [expressions, ready]);
  useEffect(() => {
    if (ready) saveToStorage(CLIENT_STORE_KEYS.CLIENT_AUDIO, clientAudio);
  }, [clientAudio, ready]);

  // ── Setters ──

  const setWeather = useCallback((w: EmotionalWeather | null) => {
    setState((s) => ({ ...s, weather: w }));
    if (w) {
      setWeatherHistory((prev) => [...prev, w].slice(-50));
    }
  }, []);

  const setTheme = useCallback((t: ClientTheme) => {
    setState((s) => ({ ...s, theme: t }));
  }, []);

  const setLowEnergyMode = useCallback((on: boolean) => {
    setState((s) => ({
      ...s,
      lowEnergyMode: on,
      lowEnergySessionCount: on
        ? s.lowEnergySessionCount + 1
        : s.lowEnergySessionCount,
    }));
  }, []);

  const activateCrisis = useCallback(
    () => setState((s) => ({ ...s, crisisModeActive: true })),
    []
  );
  const exitCrisis = useCallback(
    () => setState((s) => ({ ...s, crisisModeActive: false })),
    []
  );
  const startAftercare = useCallback(
    () => setState((s) => ({ ...s, aftercareActive: true })),
    []
  );
  const endAftercare = useCallback(
    () => setState((s) => ({ ...s, aftercareActive: false })),
    []
  );
  const incrementGroundingUse = useCallback(
    () => setState((s) => ({ ...s, groundingUses: s.groundingUses + 1 })),
    []
  );

  // ── Collections ──

  const addCheckIn = useCallback(
    (data: Partial<ClientCheckIn>): ClientCheckIn => {
      const c: ClientCheckIn = {
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        prompt: data.prompt ?? "",
        text: data.text,
        weather: data.weather ?? null,
        audioId: data.audioId,
        mode: data.mode ?? "expressive",
        createdAt: nowISO(),
        ...data,
      } as ClientCheckIn;
      setCheckIns((p) => [c, ...p]);
      return c;
    },
    []
  );

  const deleteCheckIn = useCallback((id: string) => {
    setCheckIns((p) => p.filter((c) => c.id !== id));
  }, []);

  const addComfortObject = useCallback(
    (data: Partial<ComfortObject>): ComfortObject => {
      const o: ComfortObject = {
        id: generateId(),
        kind: data.kind ?? "reminder",
        body: data.body ?? "",
        hint: data.hint,
        collection: data.collection ?? "Safe shelf",
        createdAt: nowISO(),
        ...data,
      } as ComfortObject;
      setComfortObjects((p) => [o, ...p]);
      return o;
    },
    []
  );

  const deleteComfortObject = useCallback((id: string) => {
    setComfortObjects((p) => p.filter((o) => o.id !== id));
  }, []);

  const reorderComfortObjects = useCallback((orderedIds: string[]) => {
    setComfortObjects((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      const seen = new Set<string>();
      const next: ComfortObject[] = [];
      for (const id of orderedIds) {
        const it = map.get(id);
        if (it) {
          next.push(it);
          seen.add(id);
        }
      }
      for (const o of prev) {
        if (!seen.has(o.id)) next.push(o);
      }
      return next;
    });
  }, []);

  const addSafePerson = useCallback((data: Partial<SafePerson>): SafePerson => {
    const p: SafePerson = {
      id: generateId(),
      name: data.name ?? "Unnamed",
      role: data.role,
      reminder: data.reminder,
      createdAt: nowISO(),
      ...data,
    } as SafePerson;
    setSafePeople((prev) => [p, ...prev]);
    return p;
  }, []);

  const updateSafePerson = useCallback(
    (id: string, data: Partial<SafePerson>) => {
      setSafePeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    },
    []
  );

  const deleteSafePerson = useCallback((id: string) => {
    setSafePeople((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleFavouriteCard = useCallback((cardId: string) => {
    setFavouriteCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [cardId, ...prev]
    );
  }, []);

  const completeJourneyStep = useCallback(
    (journeyId: JourneyId, stepId: string) => {
      setJourneyProgress((prev) => {
        const existing = prev[journeyId] ?? {
          journeyId,
          completedSteps: [],
          startedAt: nowISO(),
          updatedAt: nowISO(),
        };
        return { ...prev, [journeyId]: markStepComplete(existing, stepId) };
      });
    },
    []
  );

  const resetJourneyProgress = useCallback((journeyId: JourneyId) => {
    setJourneyProgress((prev) => {
      const existing = prev[journeyId] ?? {
        journeyId,
        completedSteps: [],
        startedAt: nowISO(),
        updatedAt: nowISO(),
      };
      return { ...prev, [journeyId]: resetJourney(existing, false) };
    });
  }, []);

  const addExpression = useCallback(
    (data: Partial<ExpressionCanvas>): ExpressionCanvas => {
      const e: ExpressionCanvas = {
        id: generateId(),
        blobs: data.blobs ?? [],
        note: data.note,
        weather: data.weather ?? null,
        createdAt: nowISO(),
        ...data,
      } as ExpressionCanvas;
      setExpressions((p) => [e, ...p]);
      return e;
    },
    []
  );

  const deleteExpression = useCallback((id: string) => {
    setExpressions((p) => p.filter((e) => e.id !== id));
  }, []);

  const addClientAudio = useCallback(
    (data: Partial<ClientAudio>): ClientAudio => {
      const a: ClientAudio = {
        id: generateId(),
        name: data.name ?? "Voice note",
        durationSeconds: data.durationSeconds,
        transcript: data.transcript,
        weather: data.weather ?? null,
        createdAt: nowISO(),
        ...data,
      } as ClientAudio;
      setClientAudio((p) => [a, ...p]);
      setState((s) => ({ ...s, audioReflectionCount: s.audioReflectionCount + 1 }));
      return a;
    },
    []
  );

  const deleteClientAudio = useCallback((id: string) => {
    setClientAudio((p) => p.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<ClientPortalContextType>(
    () => ({
      weather: state.weather,
      theme: state.theme,
      lowEnergyMode: state.lowEnergyMode,
      crisisModeActive: state.crisisModeActive,
      aftercareActive: state.aftercareActive,
      weatherHistory,
      audioReflectionCount: state.audioReflectionCount,
      groundingUses: state.groundingUses,
      lowEnergySessionCount: state.lowEnergySessionCount,
      checkIns,
      comfortObjects,
      safePeople,
      favouriteCardIds,
      journeyProgress: journeyProgress as Record<
        JourneyId,
        JourneyProgress | undefined
      >,
      expressions,
      clientAudio,
      setWeather,
      setTheme,
      setLowEnergyMode,
      activateCrisis,
      exitCrisis,
      startAftercare,
      endAftercare,
      incrementGroundingUse,
      addCheckIn,
      deleteCheckIn,
      addComfortObject,
      deleteComfortObject,
      reorderComfortObjects,
      addSafePerson,
      updateSafePerson,
      deleteSafePerson,
      toggleFavouriteCard,
      completeJourneyStep,
      resetJourneyProgress,
      addExpression,
      deleteExpression,
      addClientAudio,
      deleteClientAudio,
    }),
    [
      state,
      weatherHistory,
      checkIns,
      comfortObjects,
      safePeople,
      favouriteCardIds,
      journeyProgress,
      expressions,
      clientAudio,
      setWeather,
      setTheme,
      setLowEnergyMode,
      activateCrisis,
      exitCrisis,
      startAftercare,
      endAftercare,
      incrementGroundingUse,
      addCheckIn,
      deleteCheckIn,
      addComfortObject,
      deleteComfortObject,
      reorderComfortObjects,
      addSafePerson,
      updateSafePerson,
      deleteSafePerson,
      toggleFavouriteCard,
      completeJourneyStep,
      resetJourneyProgress,
      addExpression,
      deleteExpression,
      addClientAudio,
      deleteClientAudio,
    ]
  );

  return (
    <ClientPortalContext.Provider value={value}>
      {children}
    </ClientPortalContext.Provider>
  );
}

export function useClientPortal() {
  const ctx = useContext(ClientPortalContext);
  if (!ctx)
    throw new Error("useClientPortal must be used inside ClientPortalProvider");
  return ctx;
}
