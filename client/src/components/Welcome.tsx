const Welcome = () => {
  return (
    <div className="bg-[#216869]">
      <div className="w-[70vw] m-auto pt-12">
        <div>
          <h1 className="text-white text-6xl font-bold pb-5">Track Volunteer Work Effortlessly</h1>
          <p className="text-white text-3xl pb-5">Securing a generational contract through crediting
          volunteering <br/>effort with the help of Distributed Ledger Technology (DLT)</p>
        </div>
        <div className="flex flex-row flex-initial text-white py-2">
          <p className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-2xl">
            Try Now
          </p>
          <a className="px-10 items-center py-2 cursor-pointer text-2xl" href="#">Learn More →</a>
        </div>
        <img width="600px" height="600px" className="m-auto"
        src="../images/volunteering_welcome.svg" alt="Volunteering with the elderly"/>
      </div>
    </div>
  )
}

export default Welcome;
// https://storyset.com/illustration/volunteering/pana