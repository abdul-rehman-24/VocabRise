// app/hooks/useAuth.ts - Custom hook for accessing current session and auth state

import { useSession, signIn, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status, update } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn,
    signOut,
    updateSession: update,
  }
}
