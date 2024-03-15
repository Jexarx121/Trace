import { useState, useEffect, useContext } from "react";
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { supabase } from "../../supabase/supabaseClient";
import { SessionContext } from "../Context/SessionContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [toggleMenu, setToggleMenu] = useState(false);
  const { session } = useContext(SessionContext);
  
  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  };

  const goToHomepage = () => {
    navigate(LINKS.HOMEPAGE);
  };

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT);
  };

  const goToDashboard = () => {
    navigate(LINKS.DASHBOARD);
  }

  const handleLogout = () => {
    supabase.auth.signOut();
    navigate(LINKS.HOMEPAGE);
  };

  return (
    <nav className="flex bg-[#1f2421] items-center p-5 m-auto relative flex-initial">
      <div className="w-[70vw] m-auto flex items-center">
        <h1 className="text-white font-bold text-2xl cursor-pointer"
          onClick={goToHomepage}>
          Trace
        </h1>
        <ul className='md:flex hidden flex-row list-none items-center px-4 ml-auto text-white flex-initial'>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            About
          </li>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4" onClick={goToDashboard}>
            Dashboard
          </li>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4" onClick={goToAccount}>
            Profile
          </li>
          {!session ? (
            <li className="ml-4 px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold hover:bg-[#3e7d5a] transition duration-300" onClick={goToLogin}>
              Login
            </li>
          ) : (
            // add flash alert for this
            <button className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center md:text-left md:ml-4 hover:bg-[#3e7d5a] transition duration-300"
              onClick={handleLogout}>
              Sign Out
            </button>
          )}
        </ul>
        <div className="flex relative ml-auto md:hidden">
          {!toggleMenu && (
            <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
          )}
          {toggleMenu && (
            <AiOutlineClose fontSize={28} className="text-[#1f2421] md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
          )}
          {toggleMenu && (
            <ul
              className="z-10 fixed -left-0 -top-0 w-[100vw] h-screen md:hidden list-non flex flex-col
              justify-start rounded-md bg-white text-[#1f2421] animate-slide-in">
              <li className="text-3xl w-full my-2 mx-2"><AiOutlineClose className="cursor-pointer ml-2" onClick={() => setToggleMenu(false)}/></li>
              <li className="mx-4 cursor-pointer font-bold text-xl pb-5">
                About
              </li>
              <li className="mx-4 cursor-pointer font-bold text-xl pb-5" onClick={goToDashboard}>
                Dashboard
              </li>
              <li className="mx-4 cursor-pointer font-bold text-xl pb-5" onClick={goToAccount}>
                Profile
              </li>
              {!session ? (
                <li className="px-4 cursor-pointer font-bold text-xl hover:bg-[#3e7d5a] transition duration-300" onClick={goToLogin}>
                  Login
                </li>
              ) : (
                <button className="px-4 cursor-pointer font-bold md:text-left md:mr-2 hover:bg-[#3e7d5a] transition duration-300"
                  onClick={handleLogout}>
                  Sign Out
                </button>
              )}
                </ul>
              )}
        </div> 
      </div>
    </nav>
  );
};

export default Navbar;