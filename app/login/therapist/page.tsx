import { LoginScreen } from "@/components/auth/LoginScreen";

export const metadata = { title: "Therapist sign in — Psych" };

export default function TherapistLoginPage() {
  return <LoginScreen portal="therapist" />;
}
