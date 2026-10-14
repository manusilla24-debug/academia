import { redirect } from "next/navigation";
import { authenticated } from "@/lib/auth";
import { Lab } from "@/components/lab";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await authenticated())) redirect("/login");
  return <Lab />;
}
