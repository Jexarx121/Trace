import { useNavigate } from "react-router-dom"
import { LINKS } from "../constants"

type aboutItemProps = {
  title: string
  content: string,
}

const aboutContent: string[] = [
  'Trace records all volunteering work on the blockchain, ensuring a tamper-proof storage.',
  'Volunteering involving the previous and current generation of people promotes a cycle of aid for the future.',
  'Trace rewards credits to users who volunteer, allowing them to redeem it when they’re older or in need.'
]

const aboutTitles: string[] = [
  'Utilising Blockchain',
  'Creating Generational Contracts',
  'Gain Credits'
]

const AboutItem = ({title, content} : aboutItemProps) => (
  <div>
    <h2 className="text-[#49A078] font-bold pb-5 text-3xl">{title}</h2>
    <p className="pb-5 text-2xl">{content}</p>
  </div>
)

const About = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  };

  return (
    <div className="bg-[#FFFFFF] ">
      <div className="w-full md:w-[70vw] mx-auto flex flex-col lg:flex-row mt-20">
        <div className="lg:w-1/2 sm:p-5 md:p-0 px-4">
          <h1 className="font-bold mb-4 mt-4 uppercase text-[#1f2421]">About</h1>
          <div>
            {aboutTitles.map((item, index) => (
              <AboutItem key={item + index} title={item} content={aboutContent[index]} />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 p-4 text-center text-xl ml-5 flex flex-col justify-center items-center">
          <img className="w-full mb-4 max-w-[500px] h-auto" src="../images/volunteering_about.svg" alt="Volunteering by cleaning up garbage"/>
          <p className="font-bold">Free forever</p>
          <a className="text-[#49A078] hover:underline hover:underline-offset-4 cursor-pointer"
            onClick={goToLogin}>Get started now</a>
        </div>
      </div>
    </div>
  )
}

export default About;
/* <a href="https://storyset.com/people">People illustrations by Storyset</a> */