type iconItemProps = {
  icon: string;
  title: string;
  content: string;
}

const IconItems = ({ icon, title, content } : iconItemProps) => (
  <div className="flex flex-col md:mx-6 my-8 lg:my-0">
    <i className={`${icon} text-center text-5xl mb-5 text-[#49a078]`}/>
    <h1 className="text-center text-3xl font-bold">{title}</h1>
    <p className="text-center p-5 lg:text-xl text-2xl">{content}</p>
  </div>
)

const Icons = () => {
  return (
    <div className="overflow-hidden">
      <h1 className="text-center text-[3rem] my-28 md:mx-10 mx-20">Combining DLT with Volunteering.</h1>
      <div className="w-full md:w-[70%] mx-auto flex flex-col lg:flex-row flex-grow">
        <IconItems icon="fa-solid fa-shield-halved" title="Secure" 
          content="Using the decentralised, immutable property of blockchain technology to ensure your work is properly recorded." />
        <IconItems icon="fa-solid fa-clock" title="Convenient" 
          content="Everything including custodial wallets and key management, we manage for you so you can focus only on volunteering." />
        <IconItems icon="fa-solid fa-handshake-angle" title="Compensation" 
          content="Giving back to volunteers who so selflessly help others, an oppurtunity for others to do the same for them." />
      </div>
    </div>
  )
}

export default Icons;