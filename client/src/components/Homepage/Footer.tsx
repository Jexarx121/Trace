import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Session } from "@supabase/supabase-js";

const Footer = () => {
  const navigate = useNavigate();
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
  
  const goToHomepage = () => {
    navigate(LINKS.HOMEPAGE, {state: {session}});
  };

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT, {state: {session}});
  };

  const goToDashboard = () => {
    navigate(LINKS.DASHBOARD, {state: {session}});
  };
  
  return (
    <div className="bg-[#216869]">
      <div className="w-full md:w-[70vw] mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between">
          <h1 className="font-bold p-5 cursor-pointer" onClick={goToHomepage}>Trace</h1>
          <a className="p-5 cursor-pointer">About</a>
          <a className="p-5 cursor-pointer" onClick={goToDashboard}>Dashboard</a>
          <a className="p-5 cursor-pointer" onClick={goToAccount}>Profile</a>
        </div>
        <div className="border-t-2 border-gray-400 flex flex-col md:flex-row justify-start">
          <h1 className="font-bold p-5">&#169; 2023 Trace</h1> 
          <p className="p-5">All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default Footer;