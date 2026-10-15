import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <AdminLoginForm configured={Boolean(getSupabasePublicConfig())} />;
}
