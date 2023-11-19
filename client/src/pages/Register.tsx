import { AuthTitle } from "../components/Authentication";
import { RegisterForm }from "../components/Authentication";
import { LINKS } from "../components/constants";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  }

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <AuthTitle title="Trace" subTitle="Register" />
      
      <RegisterForm/>

      {/* Bottom link */}
      <div className="mt-auto">
        <p className="text-center text-[#49A078] uppercase cursor-pointer"
         onClick={goToLogin}>Already have an account?</p>
      </div>
    </div>
  );
};

export default Register;
