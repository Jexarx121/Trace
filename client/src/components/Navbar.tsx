import React from "react";
import { useState } from "react";
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';

type NavbarItemProps = {
  title: string,
};

const NavbarItem = ({title} : NavbarItemProps) => (
  <li className={`mx-4 cursor-pointer font-bold px-3 hover:underline hover:underline-offset-4`}>{title}</li>
)

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="flex bg-[#1f2421] items-center p-5 m-auto relative flex-initial">
      <div className="w-[70vw] m-auto flex items-center">
        <h1 className="text-white font-bold text-2xl cursor-pointer">
          Trace
        </h1>
        <div className="ml-auto lg:hidden">
          {isMobileMenuOpen ? (
            <AiOutlineClose
              className="text-white text-3xl cursor-pointer"
              onClick={toggleMobileMenu}
            />
          ) : (
            <HiMenuAlt4
              className="text-white text-3xl cursor-pointer"
              onClick={toggleMobileMenu}
            />
          )}
        </div>
        <ul className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } lg:flex lg:flex-row list-none items-center px-4 ml-auto text-white`}>
          {["Services", "About", "Resources"].map((item, index) => (
            <NavbarItem key={item + index} title={item} />
          ))}
          <li className="px-4 flex cursor-pointer font-bold hover:underline hover:underline-offset-4">
            Sign In
          </li>
          <li className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold">
            Login
          </li>
        </ul>
        {isMobileMenuOpen && (
          <ul
            className="z-10 fixed -top-0 w-[100vw] h-screen md:hidden list-non flex flex-col
            justify-start rounded-md bg-white text-[#1f2421] animate-slide-in">
          <li className="text-xl w-full my-2"><AiOutlineClose onClick={toggleMobileMenu}/></li>
          {["Services", "About", "Resources"].map((item, index) => (
            <NavbarItem key={item + index} title={item} />
          ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;