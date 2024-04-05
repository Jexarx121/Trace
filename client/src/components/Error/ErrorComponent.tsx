import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LINKS } from "../constants";

const ErrorComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate(LINKS.HOMEPAGE)
    }, 2000)
  })

  return (
    <div className="flex justify-center items-center h-screen">
      <div>
        <h1 className="text-5xl font-bold text-center mb-12">Oops!</h1>
        <p className="text-3xl mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-xl text-center text-gray-500">You will be redirected to the homepage soon</p>
      </div>
    </div>
  );
}

export default ErrorComponent;