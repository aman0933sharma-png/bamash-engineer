import { createFileRoute, Navigate } from "@tanstack/react-router";
import { BootMark, LoginScreen } from "@/components/supervision/login-screen";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginRoute });

function LoginRoute() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <BootMark />;
  if (user) return <Navigate to="/" />;
  return <LoginScreen />;
}
