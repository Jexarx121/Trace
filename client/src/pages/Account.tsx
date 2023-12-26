import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { LINKS } from "../components/constants";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

const { data: { user } } = await supabase.auth.getUser();

const Account = () => {
  const navigate = useNavigate();
  // This is for checking if user is already logged in
  // Need to add if user is correct person then allow editing
  // const [session, setSession] = useState<Session | null>(null);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (!session) {
  //       navigate(LINKS.LOGIN);
  //     }
  //   });
  // });

  const handleLogout = () => {
    supabase.auth.signOut();
    navigate(LINKS.HOMEPAGE);
  }

  return (
    <div>
      <h1>Hi, {user?.email}</h1>
      <button className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center md:text-left md:mr-2"
        onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default Account;