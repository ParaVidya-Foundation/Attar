import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a new account",
  robots: "noindex",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
