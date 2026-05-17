import { LoginScreen } from "@/components/auth/LoginScreen";

export const metadata = { title: "Client sign in — Psych" };

export default function ClientLoginPage() {
  return <LoginScreen portal="client" />;
}
