import { AuthTitle } from "../components/Authentication";
import { LINKS } from "../components/constants";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from '@supabase/auth-ui-shared';

const Register = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  }

  // return (
  //   <div className="flex flex-col h-screen justify-center items-center">
  //     <AuthTitle title="Trace" subTitle="Register" />
      
  //     {/* Bottom link */}
  //     <div className="mt-auto">
  //       <p className="text-center text-[#49A078] uppercase cursor-pointer"
  //        onClick={goToLogin}>Already have an account?</p>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4 text-[#263228]">Trace</h1>
      <div className="max-w-md w-full">
        <Auth supabaseClient={supabase}
          appearance={{ theme: ThemeSupa,
          variables: {
            default : {
              colors: {
                brandAccent: '#49A078',
                brandButtonText: '#263228',
                defaultButtonText: '#263228',
                defaultButtonBorder: '#4d6551',
                defaultButtonBackgroundHover: '#b7c8b9',
                inputBorder: '#263228',
                dividerBackground: '#444444',
                inputBorderFocus: '#49A078',
                inputBorderHover: '#49A078',
                anchorTextColor: '#49A078',
                anchorTextHoverColor: '#49A078'
              },
              fontSizes: {
                baseBodySize: '16px',
                baseInputSize: '18px',
                baseLabelSize: '18px',
                baseButtonSize: '18px',
              },
              fonts: {
                labelFontFamily: 'Outfit',
                inputFontFamily: 'Outfit',
                buttonFontFamily: 'Outfit'
              }
            }
          }}}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'example@example.com'
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
              }
            }
          }}
          providers={["google"]}
        />
      </div>
      
    </div>
  )


};

export default Register;
