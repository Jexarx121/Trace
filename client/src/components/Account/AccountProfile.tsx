import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { LINKS, DECIMALS } from "../constants";
import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { SessionContext } from "../Context/SessionContext";
import Security, { truncateText } from "../../helpers/functions";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { createInstance } from "../../eth/traceCredit";
import { EthContext } from "../../eth/context";
import { FaEthereum } from "react-icons/fa";
import { getPublicKey } from "../Dashboard/functions";
import { NoPostsFound, Post } from "../Dashboard/Posts";

const AccountProfile = () => {
  const navigate = useNavigate();
  const { user_id } = useParams();
  const { session } = useContext(SessionContext);
  const provider = useContext(EthContext);
  const backgroundGradient = "../images/background_gradient.jpg";
  
  const [fullName, setFullName] = useState(null);
  const [age, setAge] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState(null);
  const [passedAvatarUrl, setPassedAvatarUrl] = useState("");
  const [userId, setUserId] = useState(0);
  const [creditAmount, setCreditAmount] = useState(-1);
  const [sessionId, setSessionId] = useState("");
  const [actualAccount, setActualAccount] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [postData, setPostData] = useState<Post[]>([]);

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

  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select()
      .or(`created_by.eq.${fullName},assigned_to_name.eq.${fullName}`)
    
    if (error) {
      console.warn(error);
    };

    setPostData(data as Post[]);
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

    return ethereumAddress;
  };

  async function fundWalletTokens(receiverAddress : any, creditAmount : number) {
    const adminPrivateKey = import.meta.env.VITE_ADMIN_PRIVATE_KEY;
    
    const wallet = new ethers.Wallet(adminPrivateKey);
    const signer = wallet.connect(provider?.provider);
    const baseAmount = BigInt(creditAmount) * (10n ** 18n); // 100 credits to start off with

    const contract = createInstance(signer);
    const tx = await contract.transfer(receiverAddress, baseAmount)
    console.log(tx);
  }

  async function getUserId() {
    const { data } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', session?.user.id)
      .single();
    
    if (data && data.user_id) {
      setUserId(data.user_id);
      navigate(`/account/${userId}`);
    }
  }

  async function getBalance() {
    const { data, error } = await supabase
      .from('wallets')
      .select("ethereum_address")
      .eq('id', sessionId)
      .single();

    if (error) {
      console.warn(error);
    } else if (data) {
      const contract = createInstance(provider);
      const balance = await contract.balanceOf(data.ethereum_address);
      setCreditAmount(parseInt(balance.toString()) / DECIMALS);
    }
  };

  const checkIfAccountIsCurrentUser = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", session?.user.id)
      .single();

    if (data) {
      if (data.user_id != user_id) {
        setActualAccount(false);
      } else {
        setActualAccount(true);
      }
    };
  };

  useEffect(() => {
    // Go back to auth page if not login
    if (!session) {
      const storedSession = JSON.parse(sessionStorage.getItem("session"));
      // Stored session since context variable doesn't persist after page refresh
      if (!storedSession && !toastShown) {
        toast.error("Login required.");
        setToastShown(true);
        navigate(LINKS.LOGIN);
        return;
      }
    };

    if (user_id === ":user_id" || user_id === '0') {
      getUserId();
    }

    async function getProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select("full_name, avatar_url, age, bio, id")
        .eq('user_id', user_id)
        .single();

      // if data from database is null, user is newly joined
      if (data?.full_name === null) {
        let receiverAddress = createAndStoreWallet();
        fundWalletTokens(receiverAddress, 100);
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
        setSessionId(data.id);
      }
    };

    getProfile();
    if (creditAmount === -1) {
      getBalance();
    };

    checkIfAccountIsCurrentUser();
    getPosts();

  });

  const getFreeFunds = async () => {
    const creditAmount = 50;
    const receiverAddress = await getPublicKey(session?.user.id);
    fundWalletTokens(receiverAddress, creditAmount);
    toast.success("Your credit amount will be updated soon.")
  };

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
              <div className="flex flex-row">
                <p className="sm:text-lg text-md text-gray-600 mt-2">{age} |</p>
                <p className="sm:text-lg text-md font-bold text-[#49A078] mt-2 ml-2">{creditAmount}</p>
                <FaEthereum className="sm:text-lg text-md text-[#49A078] mt-3 ml-1"/>
              </div>
            </div>

            {/* Only render if this is the user's profile */}
            {actualAccount && (
              <div className="ml-auto flex flex-col"> 
                <Link className="m-4 rounded-md font-bold text-lg text-white flex justify-center items-center md:mx-0 mx-4"
                  to={`/edit_account/${user_id}`} state={{ session: session, fullName: fullName, passedAvatarUrl: passedAvatarUrl, age: age, bio: bio}}>
                  <i className="fa-regular fa-pen-to-square sm:text-3xl text-2xl text-[#49A078] hover:font-bold text-center" />
                </Link>
                <button type="submit" 
                  className="px-8 bg-[#49A078] py-2 rounded-md font-bold text-white hover:bg-[#3e7d5a] transition duration-300 md:mx-0 mx-4"
                  onClick={getFreeFunds}>
                  Get Funds
                </button>
              </div>
            )}
            
          </div>

          {/* Bio */}
          <div className="mb-10">
            <h1 className="text-md uppercase text-[#1f2421] font-bold py-4 border-b-black border-b-2 tracking-wider mt-8 md:mx-0 mx-4">About Me</h1>
            <p className="sm:text-xl text-lg text-md text-[#1f2421] py-4 md:mx-0 mx-4" style={{ whiteSpace: "pre-wrap"}}>{bio}</p>
          </div>
          <div className="md:mx-0 mx-4">
            <h1 className="text-md uppercase text-[#1f2421] font-bold py-4 border-b-black border-b-2 tracking-wider mt-8">Latest Work</h1>
            <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {postData.length > 0 ? (
                postData.map((post) => (
                  <div className="rounded-xl shadow-2xl border-2 border-[#2c6048] hover:shadow-slate-500 cursor-pointer" 
                    key={post.post_id}>
                    <div className="flex md:flex-row flex-col">
                      <div>
                        <h2 className="text-3xl text-[#2c6048] p-4 mr-2">{truncateText(post.title, 60)}</h2>
                        <p className="text-sm text-gray-500 pl-4 mr-2">{post.created_by} | {post.date_created.toLocaleString()}</p>
                      </div>
                    </div>  
                    <div className="p-4 flex items-center">
                      <div className="overflow-hidden">
                        <p className="text-lg text-[#1f2421] break-words">{truncateText(post.description, 150)}</p>
                      </div>
                    </div>
                    <div className="mb-4 p-4">
                      {post.status === "completed" && (
                        <a className="text-md">Completed by: <b>{post.assigned_to_name} on {post.date_finished.toLocaleString()}</b></a>
                      )}
                      {post.status === "accepted" && (
                        <a className="text-md">Assigned To: <b>{post.assigned_to_name}</b></a>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <NoPostsFound/>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// default icon
{/* <a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Becris - Flaticon</a> */}


export default AccountProfile;