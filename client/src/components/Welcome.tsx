const Welcome = () => {
  return (
    <div className="bg-[#216869]">
      <div className="w-[70vw] m-auto pt-12 flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold pb-5 text-center md:text-left">
            Track Volunteer Work Effortlessly
          </h1>
          <p className="text-white text-2xl lg:text-3xl pb-5 text-center md:text-left">
            Securing a generational contract through crediting volunteering effort with the help of Distributed Ledger Technology (DLT).
          </p>
          <div className="flex flex-col md:flex-row items-center md:items-start text-white py-2">
            <p className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center md:text-left md:mr-2">
              Try Now
            </p>
            <a className="px-8 mt-2 cursor-pointer text-center md:text-left" href="#">
              Learn More →
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center items-center mt-5 md:mt-0">
          <img className="max-w-[500px] h-auto" src="../images/volunteering_welcome.svg" alt="Volunteering with the elderly"/>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
// https://storyset.com/illustration/volunteering/pana