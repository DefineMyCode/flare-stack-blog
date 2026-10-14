import { ClientOnly } from "@tanstack/react-router";
import { useId } from "react";
import { Button } from "./button";
import { FuwariModal } from "./fuwari-modal";
import { m } from "@/paraglide/messages";
import "./confirmation-modal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  returnFocus?: () => HTMLElement | null;
  fallbackFocus?: () => HTMLElement | null;
}

function ConfirmationModalInternal(props: ConfirmationModalProps) {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading = false,
    isDanger = false,
    confirmLabel = m.common_confirm(),
  } = props;
  const titleId = useId();
  const messageId = useId();
  return (
    <FuwariModal
      open={isOpen}
      onClose={onClose}
      busy={isLoading}
      className="fuwari-confirmation"
      labelledBy={titleId}
      describedBy={messageId}
      returnFocus={props.returnFocus}
      fallbackFocus={props.fallbackFocus}
    >
      <h2 id={titleId}>{title}</h2>
      <p id={messageId}>{message}</p>
      <div className="fuwari-confirmation-actions">
        <Button disabled={!isOpen || isLoading} onClick={onClose}>
          {m.common_cancel()}
        </Button>
        <Button
          variant={isDanger ? "danger" : "primary"}
          disabled={!isOpen}
          loading={isLoading}
          onClick={onConfirm}
        >
          <span>{isLoading ? m.common_processing() : confirmLabel}</span>
        </Button>
      </div>
    </FuwariModal>
  );
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  return (
    <ClientOnly>
      <ConfirmationModalInternal {...props} />
    </ClientOnly>
  );
}
