import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { LINKS } from "../constants";
import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { SessionContext } from "../Context/SessionContext";
import Security from "../../helpers/functions";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const AccountProfile = () => {
  const navigate = useNavigate();
  const { user_id } = useParams();
  const { session } = useContext(SessionContext);
  let toastShown = false;
  const backgroundGradient = "../images/background_gradient.jpg";
  
  const [ fullName, setFullName ] = useState(null);
  const [ age, setAge ] = useState(null);
  const [ avatarUrl, setAvatarUrl ] = useState("");
  const [ bio, setBio ] = useState(null);
  const [ passedAvatarUrl, setPassedAvatarUrl ] = useState("");
  const [ userId, setUserId ] = useState(0);

  const goToEditAccountPage = () => {
    navigate(`/edit_account/${user_id}`, { state: { session, fullName, age, passedAvatarUrl, bio }});
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
  async function createAndStoreWallet() {
    const security = new Security();
    const wallet = ethers.Wallet.createRandom();
    const ethereumAddress = wallet.address;
    const ethereumPrivateAddress = security.encrypt(wallet.privateKey);

    const details = {
      id: session?.user.id,
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

  async function getUserId() {
    const { data } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', session?.user.id)
      .single();
    
    if (data && data.user_id) {
      setUserId(data.user_id);
      navigate(`/account/${userId}`)
    }
  }

  useEffect(() => {
    // Go back to auth page if not login
    if (!session) {
      const storedSession = JSON.parse(sessionStorage.getItem("session"));
      // Stored session since context variable doesn't persist after page refresh
      if (!storedSession && !toastShown) {
        toast.error("Login required.");
        toastShown = true;
        navigate(LINKS.LOGIN);
        return;
      }
    };

    if (user_id === ":user_id" || user_id === '0') {
      console.log("USER_ID : ", user_id)
      console.log("HERE CHANGED USER_ID HERE");
      getUserId();
    }

    async function getProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select("full_name, avatar_url, age, bio")
        .eq('user_id', user_id)
        .single();

      // if data from database is null, user is newly joined
      if (data?.full_name === null) {
        createAndStoreWallet();
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
  });

  const checkWallet = () => {
    createAndStoreWallet();
  }

  return (
    <div className="mb-10">
      <div>
        {/* Profile part */}
        <img className="h-56 w-full" src={backgroundGradient}/>
        <div className="w-full md:w-[70vw] mx-auto">
          <div className="flex flex-row h-48">
            <img className="sm:h-48 sm:w-48 sm:-translate-y-24 h-36 w-36 -translate-y-20 m-4 mr-6 border-white border-8 rounded-full" src={avatarUrl}/>
            <div>
              <h1 className="sm:text-4xl text-xl font-bold text-[#1f2421] mt-4">{fullName}</h1>
              <p className="sm:text-lg text-md text-gray-600 mt-2">{age}</p>
            </div>

            {/* Only render if this is the user's profile */}
            <div className="ml-auto"> 
              <Link className="m-4 bg-[#49A078] rounded-md font-bold text-lg text-white hover:bg-[#3e7d5a] transition duration-300"
                to={`/edit_account/${user_id}`} state={{ session: session, fullName: fullName, passedAvatarUrl: passedAvatarUrl, age: age, bio: bio}}>
                <HiOutlinePencilSquare className="sm:text-3xl text-2xl text-[#49A078] mr-10"/>
              </Link>
            </div>

          </div>
          {/* Bio */}
          <div className="mb-10">
            <h1 className="text-xl text-[#1f2421] font-bold p-4 border-b-black border-b-2 sm:mx-0 mx-3">About Me</h1>
            <p className="sm:text-lg text-md text-[#1f2421] p-4 sm:mx-0 mx-3" style={{ whiteSpace: "pre-wrap"}}>{bio}</p>
          </div>
          <div>
            <h1 className="text-xl text-[#1f2421] font-bold p-4 border-b-black border-b-2 sm:mx-0 mx-3">Latest Work</h1>
            {/* Insert work here */}
            <button className="px-8 mx-3 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center mt-8 text-white hover:bg-[#3e7d5a] transition duration-300"
              onClick={checkWallet}>
              Create Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// default icon
{/* <a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Becris - Flaticon</a> */}

{/* <div className="relative">
<img className="absolute top-0 left-0 w-full h-56" src={backgroundGradient} alt="Background gradient for profile" />
{/* Profile Image 
// <div className="absolute transform w-48 h-48 rounded-full overflow-hidden">
//   <img className="w-full h-full object-cover" src={avatarUrl} alt="Profile Picture" />
// </div>
// </div>

// <div className="container mx-auto p-4">
// <div className="flex flex-wrap items-center">
//   <div className="flex flex-col md:flex-row items-start">
//     {/* Text Content */}
//     <div>
//       <h1 className="text-3xl font-bold text-[#1f2421]">{fullName}</h1>
//       <h2 className="text-md text-gray-600">{age}</h2>
//       <p className="lg:text-xl text-lg mt-2 text-gray-700">
//         {bio}
//       </p>
//     </div>
//   </div>
// </div>

// {/* Edit Profile */}
// <Link className="px-8 bg-[#49A078] py-2 rounded-md font-bold text-lg text-white hover:bg-[#3e7d5a] transition duration-300"
//   to={`/edit_account/${user_id}`} state={{ session: session, fullName: fullName, passedAvatarUrl: passedAvatarUrl, age: age, bio: bio}}>
//   Edit Profile
// </Link>

// {/* Experience Section */}
// <div className="w-full mt-4">
//   <h1 className="text-3xl font-bold text-[#1f2421]">Previous Experience</h1>
//   {/* Add your work experience content here */}

// </div>
// </div> */}

export default AccountProfile;