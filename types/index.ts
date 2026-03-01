export type Rotation = 0 | 90 | 180 | 270;

export interface Desk {
  id: string;
  x: number;
  y: number;
  rotation: Rotation;
  arrangementId?: string | null;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  assignedName: string | null;
  isLocked: boolean;
  lockedName: string | null;
}

export interface DeskStore {
  desks: Desk[];
  namesList: string[];
  isDragging: boolean;
  removeMode: boolean;
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
