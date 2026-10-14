import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/muted-users/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings/muted-users", search: true });
  },
});
