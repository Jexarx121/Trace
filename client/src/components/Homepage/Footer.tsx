import { LINKS } from "../constants";
import { Link } from "react-router-dom";
import { UserIdContext } from "../Context/UserIdContext";
import { useContext } from "react";

const Footer = () => {
  const { userId } = useContext(UserIdContext);

  return (
    <div className="bg-[#216869] pt-1">
      <div className="w-full md:w-[70vw] mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between">
          <Link to={LINKS.HOMEPAGE} className="flex flex-row">
            <img src="../images/favicon-32x32.png" alt="Logo of Trace" className="my-5 ml-5 mr-2 w-8 h-8"/>
            <h1 className="font-bold py-5 pr-5  cursor-pointer">Trace</h1>
          </Link>
          <Link to={LINKS.DASHBOARD} className="p-5 cursor-pointer">Dashboard</Link>
          <Link className="p-5 cursor-pointer" to={`/account/${userId}`}>Profile</Link>
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