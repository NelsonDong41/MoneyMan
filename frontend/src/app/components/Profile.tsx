'use client'

import { useAuth } from "../Providers"

export default function Profile() {
  const { accessToken, signIn, signOut, signUp } = useAuth();

  if (accessToken) {
    return <div onClick={signOut}>Sign Out</div>
  }

  return <div>
    <div onClick={() => signIn(process.env.SUPABASE_USER_EMAIL!, process.env.SUPABASE_USER_PASS!)}>
      Sign In
    </div>
    <div onClick={() => signUp(process.env.SUPABASE_USER_EMAIL!, process.env.SUPABASE_USER_PASS!)}>
      Sign Up
    </div>
  </div>
}