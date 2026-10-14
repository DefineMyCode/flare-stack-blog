import { X } from "lucide-react";
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { m } from "@/paraglide/messages";

// A non-modal inspector: media pickers and select menus may portal outside it.
export function PostEditorInfoPanel({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      modal={false}
      backdrop
      backdropClassName="post-editor-info-backdrop"
      as="aside"
      initialFocus={() => closeRef.current}
      className="post-editor-info-panel"
      aria-labelledby={titleId}
    >
      <header className="post-editor-panel-heading">
        <h2 id={titleId}>{m.editor_info_title()}</h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="post-editor-icon-button"
          aria-label={m.common_close()}
        >
          <X size={18} />
        </button>
      </header>
      {children}
      <footer className="post-editor-info-footer">
        <button
          type="button"
          onClick={onClose}
          className="fuwari-btn-regular h-9 rounded-lg px-4 text-sm"
        >
          {m.editor_info_done()}
        </button>
      </footer>
    </Sheet>
  );
}
