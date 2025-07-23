"use client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UserContext = createContext<UserContextType | undefined>(undefined);

export type UserContextType = {
  user: User;
};

export function UserProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: User;
}) {
  const [user, setUser] = useState<User>(initial);
  const value = useMemo(() => ({ user }), [user]);

  useEffect(() => {
    setUser(initial);
  }, [initial]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
