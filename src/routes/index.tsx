import { createFileRoute } from "@tanstack/react-router";
import { BootMark, LoginScreen } from "@/components/supervision/login-screen";
import { Shell } from "@/components/supervision/shell";
import { SignInGate } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isPending } = useCurrentUserState();
  if (isPending) return <BootMark />;
  return (
    <SignInGate fallback={<LoginScreen />}>
      <Shell />
    </SignInGate>
  );
}
