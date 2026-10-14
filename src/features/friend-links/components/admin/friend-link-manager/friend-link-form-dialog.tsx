import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { FormField } from "@/components/ui/form-field";
import { FuwariModal } from "@/components/ui/fuwari-modal";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import type {
  CreateFriendLinkInput,
  FriendLinkWithUser,
} from "@/features/friend-links/friend-links.schema";
import { createCreateFriendLinkSchema } from "@/features/friend-links/friend-links.schema";
import { m } from "@/paraglide/messages";

const emptyValues: CreateFriendLinkInput = {
  siteName: "",
  siteUrl: "",
  description: "",
  logoUrl: "",
};

function valuesFrom(link: FriendLinkWithUser): CreateFriendLinkInput {
  return {
    siteName: link.siteName,
    siteUrl: link.siteUrl,
    description: link.description || "",
    logoUrl: link.logoUrl || "",
  };
}

interface FriendLinkFormDialogProps {
  open: boolean;
  link: FriendLinkWithUser | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFriendLinkInput) => void;
}

function FriendLinkFormDialogInternal({
  open,
  link,
  isSaving,
  onClose,
  onSubmit,
}: FriendLinkFormDialogProps) {
  const form = useForm<CreateFriendLinkInput>({
    resolver: standardSchemaResolver(createCreateFriendLinkSchema(m)),
    defaultValues: emptyValues,
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form;
  const [siteName, siteUrl] = watch(["siteName", "siteUrl"]);

  useEffect(() => {
    if (!open) return;
    reset(link ? valuesFrom(link) : emptyValues);
  }, [open, link, reset]);

  const editing = link !== null;

  return (
    <FuwariModal
      open={open}
      onClose={onClose}
      busy={isSaving}
      labelledBy="friend-link-form-title"
      className="max-w-[440px]"
    >
      <div className="p-6">
        <h2
          id="friend-link-form-title"
          className="text-lg font-medium fuwari-text-90"
        >
          {editing
            ? m.friend_links_edit_modal_title()
            : m.friend_links_add_modal_title()}
        </h2>
        <form
          className="mt-5 space-y-3"
          onSubmit={handleSubmit((data) =>
            onSubmit({
              siteName: data.siteName,
              siteUrl: data.siteUrl,
              description: data.description || undefined,
              logoUrl: data.logoUrl || undefined,
            }),
          )}
        >
          <FormField
            label={m.friend_links_field_name()}
            error={errors.siteName?.message}
            required
          >
            <Input
              {...register("siteName")}
              placeholder={m.friend_links_form_site_name_ph()}
            />
          </FormField>
          <FormField
            label={m.friend_links_field_url()}
            error={errors.siteUrl?.message}
            required
          >
            <Input
              {...register("siteUrl")}
              placeholder={m.friend_links_form_site_url_ph()}
            />
          </FormField>
          <FormField
            label={m.friend_links_field_desc()}
            error={errors.description?.message}
          >
            <Input
              {...register("description")}
              placeholder={m.friend_links_form_desc_ph()}
            />
          </FormField>
          <FormField
            label={m.friend_links_field_logo()}
            error={errors.logoUrl?.message}
          >
            <Input
              {...register("logoUrl")}
              placeholder={m.friend_links_form_logo_ph()}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="fuwari-btn-regular rounded-xl h-10 px-4 text-sm font-medium disabled:opacity-50"
            >
              {m.common_cancel()}
            </button>
            <button
              type="submit"
              disabled={isSaving || !siteName.trim() || !siteUrl.trim()}
              className="fuwari-btn-primary rounded-xl h-10 px-4 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing
                ? m.friend_links_edit_modal_save()
                : m.friend_links_add_modal_submit()}
            </button>
          </div>
        </form>
      </div>
    </FuwariModal>
  );
}

export function FriendLinkFormDialog(props: FriendLinkFormDialogProps) {
  return (
    <ClientOnly>
      <FriendLinkFormDialogInternal {...props} />
    </ClientOnly>
  );
}
