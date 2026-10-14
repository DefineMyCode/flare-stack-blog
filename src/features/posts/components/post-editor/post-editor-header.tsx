import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useRef, useState } from "react";
import { usePostEditorReturn } from "./post-editor-return";
import { ActionMenu } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Spinner } from "@/components/ui/spinner";
import { readPostListLocation } from "../post-manager/list-position";
import { m } from "@/paraglide/messages";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "./types";

interface PostEditorHeaderProps {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  processState: "IDLE" | "PROCESSING" | "SUCCESS";
  canPublish: boolean;
  hasPublicSnapshot: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onOpenInfo: () => void;
  infoOpen: boolean;
  onOpenHistory: () => void;
}

function saveLabel(saveStatus: SaveStatus, lastSaved: Date | null) {
  switch (saveStatus) {
    case "ERROR":
      return m.editor_status_save_error();
    case "SAVING":
      return m.editor_status_saving();
    case "PENDING":
      return m.editor_status_unsaved();
    default:
      return lastSaved
        ? m.editor_status_saved({
            time: lastSaved.toLocaleTimeString([], {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          })
        : m.editor_status_synced();
  }
}

export function PostEditorHeader({
  saveStatus,
  lastSaved,
  processState,
  canPublish,
  hasPublicSnapshot,
  onPublish,
  onUnpublish,
  onOpenInfo,
  infoOpen,
  onOpenHistory,
}: PostEditorHeaderProps) {
  const taxonomyReturn = usePostEditorReturn();
  const [returnLocation] = useState(readPostListLocation);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
  const busy = processState !== "IDLE";
  const publishLabel =
    processState === "PROCESSING"
      ? m.editor_header_processing()
      : processState === "SUCCESS"
        ? m.editor_header_success()
        : m.editor_header_publish();
  return (
    <header className="post-editor-header">
      {taxonomyReturn ? (
        <Link
          to="/admin/tags"
          search={taxonomyReturn.search}
          state={{ taxonomyScrollTop: taxonomyReturn.scrollTop }}
          className="post-editor-back hidden lg:inline-flex"
        >
          <ArrowLeft size={17} />
          {m.taxonomy_manager_title()}
        </Link>
      ) : (
        <Link
          to="/admin/posts"
          search={returnLocation}
          className="post-editor-back hidden lg:inline-flex"
        >
          <ArrowLeft size={17} />
          {m.editor_back_to_posts()}
        </Link>
      )}
      <p
        role="status"
        className={cn(
          "post-editor-save",
          saveStatus === "ERROR"
            ? "text-(--fuwari-danger-fg)"
            : saveStatus === "PENDING"
              ? "text-(--fuwari-warning-fg)"
              : "fuwari-text-50",
        )}
      >
        {saveStatus === "SAVING" ? (
          <Spinner size={15} />
        ) : saveStatus === "SYNCED" ? (
          <Check size={15} />
        ) : null}
        <span>{saveLabel(saveStatus, lastSaved)}</span>
      </p>
      <div className="post-editor-header-actions">
        <Button
          variant="plain"
          onClick={onOpenInfo}
          aria-expanded={infoOpen}
          className={cn(
            infoOpen && "bg-(--fuwari-btn-regular-bg) text-(--fuwari-primary)",
          )}
        >
          {m.editor_info_title()}
        </Button>
        <Button variant="plain" onClick={onOpenHistory}>
          {m.editor_history_list_title()}
        </Button>
        <Button
          variant="primary"
          onClick={onPublish}
          disabled={busy || !canPublish}
          loading={processState === "PROCESSING"}
          className="hidden lg:inline-flex"
        >
          {publishLabel}
        </Button>
        {hasPublicSnapshot && (
          <ActionMenu
            label={m.editor_more_actions()}
            items={[
              {
                label: m.editor_header_unpublish(),
                danger: true,
                disabled: busy,
                onSelect: (trigger) => {
                  menuTriggerRef.current = trigger;
                  setConfirmingUnpublish(true);
                },
              },
            ]}
          />
        )}
      </div>
      <ConfirmationModal
        isOpen={confirmingUnpublish}
        title={m.editor_unpublish_confirm_title()}
        message={m.editor_unpublish_confirm_desc()}
        confirmLabel={m.editor_header_unpublish()}
        isDanger
        onClose={() => setConfirmingUnpublish(false)}
        onConfirm={() => {
          setConfirmingUnpublish(false);
          onUnpublish();
        }}
        returnFocus={() => menuTriggerRef.current}
      />
    </header>
  );
}
