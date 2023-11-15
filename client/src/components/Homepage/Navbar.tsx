import { useState } from "react";
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";

type NavbarItemProps = {
  title: string,
  classprops: string
};

const NavbarItem = ({title, classprops} : NavbarItemProps) => (
  <li className={`mx-4 cursor-pointer font-bold ${classprops}`}>{title}</li>
)

const Navbar = () => {
  const navigate = useNavigate();
  const [toggleMenu, setToggleMenu] = useState(false);

  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  };

  return (
    <nav className="flex bg-[#1f2421] items-center p-5 m-auto relative flex-initial">
      <div className="w-[70vw] m-auto flex items-center">
        <h1 className="text-white font-bold text-2xl cursor-pointer">
          Trace
        </h1>
        <ul className='md:flex hidden flex-row list-none items-center px-4 ml-auto text-white flex-initial'>
          {["Services", "About", "Resources"].map((item, index) => (
            <NavbarItem key={item + index} title={item} classprops="px-3 hover:underline hover:underline-offset-4" />
          ))}
          <li className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold" onClick={goToLogin}>
            Login
          </li>
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
              {["Services", "About", "Resources"].map((item, index) => (
                <NavbarItem key={item + index} title={item} classprops="text-xl pb-5"/>
              ))}
              <li className="mx-4 text-xl cursor-pointer font-bold text-[#49A078]">
                Sign Up
              </li>
            </ul>
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;