'use client';
import type { ReactNode } from "react";
import { AuthProvider } from "../Auth/Auth";
import PersistentLayout from "./PersistentLayout";

export default function ClientRoot({  children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PersistentLayout>
        {children}
      </PersistentLayout>
    </AuthProvider>
  );
}
