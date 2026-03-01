"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Desk, Rotation } from "@/types";
import { shuffle } from "@/utils/shuffle";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1200;
const DESK_WIDTH = 80;
const DESK_HEIGHT = 60;
const CHAIR_SIZE = 24;

function generateId(): string {
  return `desk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

function createDefaultDesk(x?: number, y?: number, arrangementId?: string | null): Desk {
  return {
    id: generateId(),
    x: x ?? 100,
    y: y ?? 100,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    arrangementId: arrangementId ?? null,
    assignedName: null,
    isLocked: false,
    lockedName: null,
  };
}

interface DeskState {
  desks: Desk[];
  namesList: string[];
  isDragging: boolean;
  removeMode: boolean;
}

interface DeskActions {
  addDesk: (x?: number, y?: number) => void;
  createArrangement: (rows: number, cols: number) => void;
  moveArrangement: (arrangementId: string, dx: number, dy: number) => void;
  removeDesk: (id: string) => void;
  moveDesk: (id: string, x: number, y: number) => void;
  rotateDesk: (id: string) => void;
  rotateDeskLeft: (id: string) => void;
  rotateDeskRight: (id: string) => void;
  flipDeskHorizontal: (id: string) => void;
  flipDeskVertical: (id: string) => void;
  setDeskLocked: (id: string, locked: boolean, lockedName?: string | null) => void;
  assignNameToDesk: (id: string, name: string | null) => void;
  setNamesList: (names: string[]) => void;
  addName: (name: string) => void;
  removeName: (index: number) => void;
  setIsDragging: (value: boolean) => void;
  setRemoveMode: (value: boolean) => void;
  randomize: () => void;
  clearAssignments: () => void;
  resetAll: () => void;
}

export const useDeskStore = create<DeskState & DeskActions>()(
  persist(
    (set, get) => ({
      desks: [createDefaultDesk(150, 150), createDefaultDesk(300, 150)],
      namesList: [],
      isDragging: false,
      removeMode: false,

      addDesk: (x?, y?) => {
        const defaultX = CANVAS_WIDTH / 2 - DESK_WIDTH / 2;
        const defaultY = CANVAS_HEIGHT / 2 - DESK_HEIGHT / 2;

        let cx = x ?? defaultX;
        let cy = y ?? defaultY;

        // When using the toolbar "Add desk" button (no explicit x/y),
        // slightly offset each new desk around the center so they
        // don't perfectly overlap and the user can see the new one.
        if (x == null && y == null) {
          const { desks } = get();
          const nearby = desks.filter(
            (d) => Math.abs(d.x - defaultX) < 60 && Math.abs(d.y - defaultY) < 60
          );

          if (nearby.length > 0) {
            const index = nearby.length;
            const radius = 40;
            const angle = (index * Math.PI) / 4; // 45° steps
            cx = defaultX + Math.cos(angle) * radius;
            cy = defaultY + Math.sin(angle) * radius;
          }
        }

        set((state) => ({
          desks: [...state.desks, createDefaultDesk(cx, cy, null)],
        }));
      },

      createArrangement: (rows, cols) => {
        const safeRows = Math.max(1, Math.min(20, Math.floor(rows)));
        const safeCols = Math.max(1, Math.min(20, Math.floor(cols)));
        const arrangementId = generateId();

        const spacingX = DESK_WIDTH + 40;
        const spacingY = DESK_HEIGHT + 40;
        const totalWidth = DESK_WIDTH + (safeCols - 1) * spacingX;
        const totalHeight = (DESK_HEIGHT + CHAIR_SIZE) + (safeRows - 1) * spacingY;

        const startX = CANVAS_WIDTH / 2 - totalWidth / 2;
        const startY = CANVAS_HEIGHT / 2 - totalHeight / 2;

        const newDesks: Desk[] = [];
        for (let r = 0; r < safeRows; r++) {
          for (let c = 0; c < safeCols; c++) {
            const x = startX + c * spacingX;
            const y = startY + r * spacingY;
            newDesks.push(createDefaultDesk(x, y, arrangementId));
          }
        }

        set((state) => ({
          desks: [...state.desks, ...newDesks],
        }));
      },

      moveArrangement: (arrangementId, dx, dy) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.arrangementId === arrangementId
              ? { ...d, x: d.x + dx, y: d.y + dy }
              : d
          ),
        }));
      },

      removeDesk: (id) => {
        set((state) => ({
          desks: state.desks.filter((d) => d.id !== id),
        }));
      },

      moveDesk: (id, x, y) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.id === id ? { ...d, x, y } : d
          ),
        }));
      },

      rotateDesk: (id) => {
        set((state) => ({
          desks: state.desks.map((d) => {
            if (d.id !== id) return d;
            const idx = ROTATIONS.indexOf(d.rotation);
            const next = ROTATIONS[(idx + 1) % 4];
            return { ...d, rotation: next };
          }),
        }));
      },

      rotateDeskLeft: (id) => {
        set((state) => ({
          desks: state.desks.map((d) => {
            if (d.id !== id) return d;
            const idx = ROTATIONS.indexOf(d.rotation);
            const next = ROTATIONS[(idx + 3) % 4];
            return { ...d, rotation: next };
          }),
        }));
      },

      rotateDeskRight: (id) => {
        set((state) => ({
          desks: state.desks.map((d) => {
            if (d.id !== id) return d;
            const idx = ROTATIONS.indexOf(d.rotation);
            const next = ROTATIONS[(idx + 1) % 4];
            return { ...d, rotation: next };
          }),
        }));
      },

      flipDeskHorizontal: (id) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.id === id
              ? { ...d, flipHorizontal: !(d.flipHorizontal ?? false) }
              : d
          ),
        }));
      },

      flipDeskVertical: (id) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.id === id
              ? { ...d, flipVertical: !(d.flipVertical ?? false) }
              : d
          ),
        }));
      },

      setDeskLocked: (id, locked, lockedName) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.id === id
              ? {
                  ...d,
                  isLocked: locked,
                  lockedName: locked ? lockedName ?? d.lockedName : null,
                  assignedName: locked && lockedName ? lockedName : d.assignedName,
                }
              : d
          ),
        }));
      },

      assignNameToDesk: (id, name) => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.id === id ? { ...d, assignedName: name } : d
          ),
        }));
      },

      setNamesList: (names) => set({ namesList: names }),

      addName: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          namesList: [...state.namesList, trimmed],
        }));
      },

      removeName: (index) => {
        set((state) => ({
          namesList: state.namesList.filter((_, i) => i !== index),
        }));
      },

      setIsDragging: (value) => set({ isDragging: value }),
      setRemoveMode: (value) => set({ removeMode: value }),

      randomize: () => {
        const { desks, namesList } = get();
        const unlockedDesks = desks.filter((d) => !d.isLocked);
        const lockedNames = new Set(
          desks.filter((d) => d.isLocked && d.lockedName).map((d) => d.lockedName!)
        );
        const availableNames = namesList.filter((n) => !lockedNames.has(n));
        const shuffledNames = shuffle(availableNames);
        const shuffledDesks = shuffle([...unlockedDesks]);

        set((state) => {
          const deskIdsToNames = new Map<string, string | null>();
          shuffledDesks.forEach((desk, idx) => {
            deskIdsToNames.set(desk.id, shuffledNames[idx] ?? null);
          });
          const updated = state.desks.map((d) => {
            if (d.isLocked && d.lockedName) return d;
            const name = deskIdsToNames.get(d.id) ?? null;
            return { ...d, assignedName: name };
          });
          return { desks: updated };
        });
      },

      clearAssignments: () => {
        set((state) => ({
          desks: state.desks.map((d) =>
            d.isLocked ? d : { ...d, assignedName: null }
          ),
        }));
      },

      resetAll: () => {
        set((state) => ({
          desks: state.desks.map((d) => ({
            ...d,
            assignedName: null,
            isLocked: false,
            lockedName: null,
            flipHorizontal: false,
            flipVertical: false,
          })),
          namesList: [],
        }));
      },
    }),
    { name: "desk-randomizer-storage" }
  )
);
