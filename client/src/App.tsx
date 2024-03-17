import { Homepage, Login, Account, EditAccount, Dashboard } from "./pages";
import { Routes, Route } from "react-router-dom";
import { LINKS } from "./components/constants";
import { EthContext } from "./eth/context";
import { SessionContext } from "./components/Context/SessionContext";
import { createProvider } from "./eth/provider";
import { createInstance } from "./eth/forwarder";
import { useEffect, useState } from "react";
import { supabase } from "./supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { UserIdContext } from "./components/Context/UserIdContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  const provider = createProvider();
  const nodeManager = createInstance(provider);
  const ethContext = { nodeManager, provider };
  const [ userId, setUserId ] = useState<number>(0);
  const [ session, setSession ] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      sessionStorage.setItem("session", JSON.stringify(session));
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      sessionStorage.setItem("session", JSON.stringify(session));
    })

    return () => subscription.unsubscribe()
  }, []);

  async function getUserId() {
    const { data, error } = await supabase
      .from('profiles')
      .select("user_id")
      .eq('id', session?.user.id)
      .single();

    if (error) {
      console.warn(error);
    }
    
    setUserId(data?.user_id);
  };

  useEffect(() => {
    getUserId();
  });

  return (
    <SessionContext.Provider value={{ session }}>
      <UserIdContext.Provider value={{ userId }}>
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
        <Toaster toastOptions={{
          success: {
            style: {
              background: '#263228',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'Outfit'
            }
          },
          error: {
            style: {
              background: '#dc2626',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'Outfit',
            }
          }
        }}/>
      </UserIdContext.Provider>
    </SessionContext.Provider>
  );
};

export default App;
