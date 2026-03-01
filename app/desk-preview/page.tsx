"use client";

import { DndContext } from "@dnd-kit/core";
import { Desk } from "@/components/Desk";
import type { Desk as DeskType } from "@/types";

const previewDesk: DeskType = {
  id: "preview-desk",
  x: 20,
  y: 10,
  rotation: 0,
  assignedName: "Preview",
  isLocked: false,
  lockedName: null,
};

export default function DeskPreviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <DndContext>
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
          }}
        >
          <Desk desk={previewDesk} />
        </div>
      </DndContext>
    </div>
  );
}

