import { LINKS } from "../constants";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="bg-[#216869] pb-20">
      <div className="w-[70vw] m-auto pt-12 flex flex-col lg:flex-row">
        <div className="lg:w-1/2">
          <h1 className="text-white text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-bold pb-5 text-center md:text-left">
            Record Volunteer Work
          </h1>
          <p className="text-white text-2xl lg:text-2xl xl:text-3xl pb-5 text-center md:text-left">
            Securing a generational contract through crediting volunteering effort with the help of Distributed Ledger Technology (DLT).
          </p>
          <div className="flex flex-col md:flex-row items-center md:items-start text-white py-2">
            <Link className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center md:text-left md:mr-2"
              to={LINKS.ACCOUNT}>
              Try Now
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center items-center mt-12 lg:mt-0">
          <img className="max-w-[500px] h-auto" src="/volunteering_welcome.svg" alt="Volunteering with the elderly"/>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
// https://storyset.com/illustration/volunteering/pana