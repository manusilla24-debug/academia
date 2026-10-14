import { Login } from "@/components/login";
import { demoAllowed, usesSupabaseAuth } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default function Page() {
  return <Login demo={demoAllowed()} remote={usesSupabaseAuth()} />;
}
