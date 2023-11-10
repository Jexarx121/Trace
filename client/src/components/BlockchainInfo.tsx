const BlockchainInfo = () => {
  return (
    <div className="bg-[#216869]">
      <div className="w-full md:w-[70vw] mx-auto pt-12 pb-12 flex flex-col md:flex-row">
        <div className="md:w-1/2 text-white p-4">
          <h1 className="font-bold mb-4 mt-4 uppercase text-[#FFFFFF]">BLOCKCHAIN INFO</h1>
          <h1 className="font-bold text-5xl tracking-wide pb-5">Built with DLT</h1>
          <p className="text-2xl pb-5">
          Trace utilizes Distributed Ledger Technology (DLT) to meticulously track all
           volunteering work, providing a secure and tamper-proof method of storage.
          </p>
          <div className="flex flex-row flex-initial text-white py-2">
            <p className="px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-2xl">
              Try Now
            </p>
            <a className="px-10 items-center py-2 cursor-pointer text-2xl" href="#">Learn More →</a>
          </div>
        </div>
        <div className="w-full md:w-1/2 ml-5">
          <img className="w-full"
          src="../images/blockchain_info.svg" alt="Blockchain Info"/>
        </div>
      </div>
    </div>
  )
}

export default BlockchainInfo;