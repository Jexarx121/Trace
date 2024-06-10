import { useState, useContext } from "react";
import { AiOutlineClose } from 'react-icons/ai';
import { MdMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { supabase } from "../../supabase/supabaseClient";
import { SessionContext } from "../Context/SessionContext";
import { Link } from "react-router-dom";
import { UserIdContext } from "../Context/UserIdContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [ toggleMenu, setToggleMenu ] = useState(false);
  const { session } = useContext(SessionContext);
  const { userId } = useContext(UserIdContext);

  const handleLogout = () => {
    toast.success("You have been logged out.");
    supabase.auth.signOut();
    navigate(LINKS.HOMEPAGE);
    sessionStorage.clear();
  };

  const handleLinkClick = () => {
    // Force a page refresh after the navigation
    navigate(`/account/${userId}`);
    window.location.reload();
  }

  return (
    <nav className="flex bg-[#1f2421] items-center p-5 m-auto relative flex-initial">
      <div className="w-full md:w-[70vw] m-auto flex items-center">
        <Link to={LINKS.HOMEPAGE} className="flex flex-row">
          <img src="/favicon-32x32.png" alt="Logo of Trace" className="mr-2"/>
          <h1 className="text-white font-bold text-2xl cursor-pointer">
            Trace
          </h1>
        </Link>
        <ul className='md:flex hidden flex-row list-none items-center px-4 ml-auto text-white flex-initial'>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            <Link to={LINKS.DASHBOARD} >Dashboard</Link>
          </li>
          <li className="mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4">
            <Link to={`/account/${userId}`} onClick={handleLinkClick}>Profile</Link>
          </li>
          {!session ? (
            <li>
              <Link className="ml-4 px-8 bg-[#49A078] py-2 rounded-md font-bold hover:bg-[#3e7d5a] transition duration-300" 
                to={LINKS.LOGIN}>Login</Link>
            </li>
          ) : (
            // add flash alert for this
            <button className="px-8 bg-[#49A078] py-2 rounded-md font-bold md:text-left md:ml-4 hover:bg-[#3e7d5a] transition duration-300"
              onClick={handleLogout}>
              Sign Out
            </button>
          )}
        </ul>
        <div className="flex relative ml-auto md:hidden">
          {!toggleMenu && (
            <MdMenu fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
          )}
          {toggleMenu && (
            <AiOutlineClose fontSize={28} className="text-[#1f2421] md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
          )}
          {toggleMenu && (
            <ul className="z-10 fixed -left-0 -top-0 w-[100vw] h-screen md:hidden list-non flex flex-col
              justify-start rounded-md bg-white text-[#1f2421] animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl my-5 mx-4 flex-grow font-bold"><Link to={LINKS.HOMEPAGE}>Trace</Link></h1>
                <AiOutlineClose className="cursor-pointer mr-4 text-3xl" onClick={() => setToggleMenu(false)}/>
              </div>
              <li className="mx-4 cursor-pointer text-xl mb-6 pb-6 border-b border-gray-300">
                <Link to={LINKS.DASHBOARD}>Dashboard</Link>
              </li>
              <li className="mx-4 cursor-pointer text-xl mb-6 pb-6 border-b border-gray-300">
                <Link to={`/account/${userId}`}>Profile</Link>
              </li>
              {!session ? (
                <li >
                  <Link className="px-4 cursor-pointer text-xl" 
                    to={LINKS.LOGIN}>Login</Link>
                </li>
              ) : (
                <button className="px-4 text-xl text-left md:mr-2"
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