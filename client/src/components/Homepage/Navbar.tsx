import { useState, useContext } from "react";
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { supabase } from "../../supabase/supabaseClient";
import { SessionContext } from "../Context/SessionContext";
import { Link } from "react-router-dom";
import { UserIdContext } from "../Context/UserIdContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [toggleMenu, setToggleMenu] = useState(false);
  const { session } = useContext(SessionContext);
  const { userId } = useContext(UserIdContext);

  const handleLogout = () => {
    toast.success("You have been logged out.")
    supabase.auth.signOut();
    navigate(LINKS.HOMEPAGE);
  };

  return (
    <nav className="flex bg-[#1f2421] items-center p-5 m-auto relative flex-initial">
      <div className="w-[70vw] m-auto flex items-center">
        <h1 className="text-white font-bold text-2xl cursor-pointer">
          <Link to={LINKS.HOMEPAGE}>Trace</Link>
        </h1>
        <ul className='md:flex hidden flex-row list-none items-center px-4 ml-auto text-white flex-initial'>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            About
          </li>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            <Link to={LINKS.DASHBOARD}>Dashboard</Link>
          </li>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            <Link to={`/account/${userId}`}>Profile</Link>
          </li>
          {!session ? (
            <li>
              <Link className="ml-4 px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold hover:bg-[#3e7d5a] transition duration-300" 
                to={LINKS.LOGIN}>Login</Link>
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
              <li className="mx-4 cursor-pointer font-bold text-xl pb-5">
                <Link to={LINKS.DASHBOARD}>Dashboard</Link>
              </li>
              <li className="mx-4 cursor-pointer font-bold text-xl pb-5">
                <Link to={`/account/${userId}`}>Profile</Link>
              </li>
              {!session ? (
                <li >
                  <Link className="px-4 cursor-pointer font-bold text-xl" 
                    to={LINKS.LOGIN}>Login</Link>
                </li>
              ) : (
                <button className="px-4 cursor-pointer font-bold text-xl text-left md:mr-2"
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