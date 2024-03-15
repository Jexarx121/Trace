import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { useContext } from "react";
import { SessionContext } from "../Context/SessionContext";

const Footer = () => {
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);
  
  const goToHomepage = () => {
    navigate(LINKS.HOMEPAGE);
  };

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT);
  };

  const goToDashboard = () => {
    navigate(LINKS.DASHBOARD);
  };
  
  return (
    <div className="bg-[#216869] pt-1">
      <div className="w-full md:w-[70vw] mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between">
          <h1 className="font-bold p-5 cursor-pointer" onClick={goToHomepage}>Trace</h1>
          <a className="p-5 cursor-pointer">About</a>
          <a className="p-5 cursor-pointer" onClick={goToDashboard}>Dashboard</a>
          <a className="p-5 cursor-pointer" onClick={goToAccount}>Profile</a>
        </div>
        <div className="border-t-2 border-gray-400 flex flex-col md:flex-row justify-start">
          <h1 className="font-bold p-5">&#169; 2024 Trace</h1> 
          <p className="p-5">All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;