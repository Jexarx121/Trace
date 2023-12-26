import { supabase } from "../supabase/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { LINKS } from "../components/constants";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })

    return () => subscription.unsubscribe()
  }, []);

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT);
  }

  if (!session) {
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
    );
  } else {
    goToAccount();
  };
};

export default Login;
