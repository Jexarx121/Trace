import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { LINKS } from "../constants";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import Security from "../../helpers/functions";

const AccountProfile = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const session = location.state?.session;
  
  const [fullName, setFullName] = useState(null);
  const [age, setAge] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState(null);
  const [passedAvatarUrl, setPassedAvatarUrl] = useState("");

  const goToEditAccountPage = () => {
    navigate(LINKS.EDIT_ACCOUNT, { state: { session, fullName, age, passedAvatarUrl, bio }});
  };

  async function downloadImage(path : string) {
    try {
      setPassedAvatarUrl(path);
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error);
    }
  };

  // Called when users register for the first time to create a wallet for each
  async function createAndStoreWallet(userId : string) {
    const security = new Security();
    const wallet = ethers.Wallet.createRandom();
    const ethereumAddress = wallet.address;
    const ethereumPrivateAddress = security.encrypt(wallet.privateKey);

    const details = {
      id: userId,
      ethereum_address: ethereumAddress,
      ethereum_private_address: ethereumPrivateAddress
    };

    const { error } = await supabase.from('wallets').insert(details);

    if (error) {
      // Throw 404 page here
      console.error('Error storing wallet:', error);
      throw error;
    };
  };

  useEffect(() => {
    let ignore = false;
    // Go back to auth page if not login
    if (!session) {
      navigate(LINKS.LOGIN);
    };

    async function getProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select("full_name, avatar_url, age, bio")
        .eq('id', session?.user.id)
        .single();

      // if data from database is null, user is newly joined
      if (data?.full_name === null) {
        createAndStoreWallet(session.user.id);
        goToEditAccountPage();
      };

      if (error) {
        // 404 page here
        console.warn(error);
      } else if (data) {
        setFullName(data.full_name);
        setAge(data.age);
        downloadImage(data.avatar_url);
        setBio(data.bio);
      }
    };

    getProfile();

    return () => {
      ignore = true;
    };
  });

  const checkWallet = () => {
    createAndStoreWallet(session.user.id);
  }

  return (
    <div>
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap">
          {/* Account Profile Div */}
          <div className="w-full mb-4 sm:flex-col">
            <div className="flex flex-col md:flex-row items-start">
              <img className="w-48 h-48 rounded-full mb-4 md:mr-4 md:mb-0" src={avatarUrl} alt="Profile Picture" />
              <div>
                <h1 className="text-3xl font-bold text-[#1f2421]">{fullName}</h1>
                <h2 className="text-md text-gray-600">{age}</h2>
                <p className="lg:text-xl text-lg mt-2 text-gray-700">
                {bio}
                </p>
              </div>
            </div>
            <button className="ml-auto px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center mt-8 text-white hover:bg-[#3e7d5a] transition duration-300"
              onClick={goToEditAccountPage}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="w-full mt-4">
          <h1 className="text-3xl font-bold text-[#1f2421]">Previous Experience</h1>
          {/* Add your work experience content here */}
          <button className="ml-auto px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center mt-8 text-white hover:bg-[#3e7d5a] transition duration-300"
            onClick={checkWallet}>
            Create Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

// default icon
{/* <a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Becris - Flaticon</a> */}

export default AccountProfile;