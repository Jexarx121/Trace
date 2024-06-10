import { supabase } from "../../supabase/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useContext } from "react";
import { LINKS } from "../constants";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../Context/SessionContext";
import { Link } from "react-router-dom";

const AuthForm = () => {
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4 text-[#263228]">
          <Link to={LINKS.HOMEPAGE}>Trace</Link>
        </h1>
        <div className="max-w-md w-full sm:p-0 p-4">
          <Auth supabaseClient={supabase}
            appearance={{ theme: ThemeSupa,
            variables: {
              default : {
                colors: {
                  brandAccent: '#49A078',
                  brandButtonText: '#263228',
                  defaultButtonText: '#263228',
                  defaultButtonBorder: '#49A078',
                  defaultButtonBackgroundHover: '#49A078',
                  inputBorder: '#263228',
                  dividerBackground: '#444444',
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
                },
                borderWidths: {
                  buttonBorderWidth: '2px',
                  inputBorderWidth: '2px'
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
            redirectTo="/account/:user_id"
          />
        </div>
      </div>
    );
  } else {
    goToAccount();
  }
};

export default AuthForm;