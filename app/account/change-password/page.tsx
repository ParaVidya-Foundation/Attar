import type { Metadata } from "next";
import ChangePasswordForm from "@/components/account/changepasswordform";

export const metadata: Metadata = {
  title: "Change Password",
  robots: "noindex",
};

export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
