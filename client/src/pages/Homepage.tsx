import { useState } from "react";
import HomepageComponent from "../components/Homepage/Homepage";

const Homepage = () => {
  const [show, setShow] = useState(true);

  return (
    <>
      <HomepageComponent/>
      {show && (
        <div onClick={(e) => {
          e.stopPropagation()}}
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col md:h-auto h-[100%]">
            <div className="flex flex-row">
              <h1 className="text-2xl font-bold text-red-500">
                Website functionality might be limited due to blockchain updates and eth wallet. Maybe I will update it someday :&#41;.
                
              </h1>
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={() => setShow(false)}>
                &times;
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Homepage;