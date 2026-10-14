import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { MOTION, useMotionPresence } from "@/hooks/use-motion";
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
  const present = useMotionPresence(open, MOTION.panel);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!present) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [present]);

  if (!present) return null;
  return (
    <>
      <button
        type="button"
        className="post-editor-info-backdrop"
        data-state={open ? "open" : "closing"}
        disabled={!open}
        aria-label={m.common_close()}
        tabIndex={-1}
        onClick={onClose}
      />
      <aside
        className="post-editor-info-panel"
        data-state={open ? "open" : "closing"}
        inert={!open}
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          // Let portalled pickers and open comboboxes handle their own Escape first.
          if (
            event.key === "Escape" &&
            !event.defaultPrevented &&
            event.currentTarget.contains(event.target as Node) &&
            !event.currentTarget.querySelector('[aria-expanded="true"]')
          ) {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <header className="post-editor-panel-heading">
          <h2 id={titleId}>{m.editor_info_title()}</h2>
          <IconButton
            ref={closeRef}
            size="md"
            onClick={onClose}
            label={m.common_close()}
          >
            <X size={18} />
          </IconButton>
        </header>
        {children}
        <footer className="post-editor-info-footer">
          <Button onClick={onClose}>{m.editor_info_done()}</Button>
        </footer>
      </aside>
    </>
  );
}
