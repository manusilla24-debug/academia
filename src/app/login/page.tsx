import { Login } from "@/components/login";
import { demoAllowed } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Login demo={demoAllowed()} remote={process.env.APP_MODE === "supabase"} />
  );
}
