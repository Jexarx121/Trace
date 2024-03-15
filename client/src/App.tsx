import { Homepage, Login, Account, EditAccount, Dashboard } from "./pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LINKS } from "./components/constants";
import { EthContext } from "./eth/context";
import { SessionContext } from "./components/Context/SessionContext";
import { createProvider } from "./eth/provider";
import { createInstance } from "./eth/forwarder";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";

const App = () => {
  const provider = createProvider();
  const nodeManager = createInstance(provider);
  const ethContext = { nodeManager, provider };

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => subscription.unsubscribe()
  }, []);

  return (
    <SessionContext.Provider value={ {session} }>
      <Router>
        <Routes>
          <Route path={LINKS.ACCOUNT} element={<Account/>}/>
          <Route path={LINKS.EDIT_ACCOUNT} element={<EditAccount/>}/>
          <Route path={LINKS.LOGIN} element={<Login/>}/>
          <Route path={LINKS.HOMEPAGE} element={<Homepage/>}/>
          <Route path={LINKS.DASHBOARD} element={
            <EthContext.Provider value={ethContext}>
              <Dashboard/>
            </EthContext.Provider>
          }/>
        </Routes>
      </Router>
    </SessionContext.Provider>
 
  );
};

export default App;
