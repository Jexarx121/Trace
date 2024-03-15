import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

interface SessionContextType { 
  session: Session | null;
}

export const SessionContext = createContext<SessionContextType>({session : null});