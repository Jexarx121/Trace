const Footer = () => {
  return (
    <div className="bg-[#216869]">
      <div className="w-full md:w-[70vw] mx-auto text-white">
        <div className="flex flex-col md:flex-row justify-between">
          <h1 className="font-bold p-5 cursor-pointer">Trace</h1>
          <a className="p-5 cursor-pointer">Services</a>
          <a className="p-5 cursor-pointer">About</a>
          <a className="p-5 cursor-pointer">Resources</a>
        </div>
        <div className="border-t-2 border-gray-400 flex flex-col md:flex-row justify-start">
          <h1 className="font-bold p-5">&#169; 2023 Trace</h1> 
          <p className="p-5">All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default Footer;