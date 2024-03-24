import { useContext, useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { postSchema, finishedPostSchema, DashboardPostTypeItem } from ".";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DECIMALS, LINKS } from "../constants";
import { Post, NoPostsFound } from "./Posts";
import { truncateText, capitalize }from "../../helpers/functions";
import { ethers } from "ethers";
import { EthContext } from "../../eth/context";
import { SessionContext } from "../Context/SessionContext";
import { downloadImage, calculateCredit, getPublicKey, getPrivateKey } from "./functions";
import { createInstance } from "../../eth/nodeManager";
import { createInstance as createTraceInstance } from "../../eth/traceCredit";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type PostSchema = z.infer<typeof postSchema>;
type FinishedPostSchema = z.infer<typeof finishedPostSchema>;

const DashboardInfo = () => { 
  const navigate = useNavigate();
  const { session } = useContext(SessionContext);;
  const provider = useContext(EthContext);
  let toastShown = false;

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [postData, setPostData] = useState<Post[]>([]);
  const [filteredAvailablePosts, setFilteredAvailablePosts] = useState<Post[]>([]);
  const [filteredCompletePosts, setFilteredCompletePosts] = useState<Post[]>([]);
  const [filteredPersonalPosts, setFilteredPersonalPosts] = useState<Post[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [avatarUrlList, setAvatarUrlList] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [finishPostModal, setFinishPostModal] = useState(false);
  const [showDetailsAboutCompletePost, setShowDetailsAboutCompletePost] = useState(false);
  const [viewCompletePosts, setViewCompletePosts] = useState(false);
  const [viewAvailablePosts, setViewAvailablePosts] = useState(true);
  const [viewPersonalPosts, setViewPersonalPosts] = useState(false);
  const [completePostModal, setCompletePostModal] = useState(false);
  const [userId, setUserId] = useState(0);
  const [createPostCreditAmount, setCreatePostCreditAmount] = useState(0);
  const [nodeDetails, setNodeDetails] = useState({
    creditAmount: '',
    hoursWorked: '',
    amountOfPeople: ''
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  const showTotalPosts = () => {
    setViewCompletePosts(true);
    setViewAvailablePosts(true);
    setViewPersonalPosts(true);
  };

  const showAvailablePosts = () => {
    setViewCompletePosts(false);
    setViewAvailablePosts(true);
    setViewPersonalPosts(false);
  };

  const showCompletedPosts = () => {
    setViewCompletePosts(true);
    setViewAvailablePosts(false);
    setViewPersonalPosts(false);
  };

  const showPersonalPosts = () => {
    setViewCompletePosts(false);
    setViewAvailablePosts(false);
    setViewPersonalPosts(true);
  };

  const openCompleteModal = (post: Post) => {
    setSelectedPost(post);
    setCompletePostModal(true);
  }

  const closeCompleteModal = () => {
    setCompletePostModal(false);
    setSelectedPost(null);
    setShowDetailsAboutCompletePost(false);
  }

  const closeModal = () => {
    resetCreate();
    setConfirmRequest(false);
    setCreatePostCreditAmount(0);
    setLoading(false);
    setIsModalOpen(false);
  };

  const showAcceptedPost = (post : Post) => {
    setSelectedPost(post);
    setIsRequestModalOpen(true);
  };

  const closeAcceptedPost = () => {
    setSelectedPost(null);
    setConfirmRequest(false);
    setIsRequestModalOpen(false);
    setShowDetailsAboutCompletePost(false);
  }

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    resetUpdate();
    setIsUpdateModalOpen(false);
  };

  const openFinishModal = () => {
    const currentPost = selectedPost;
    closeAcceptedPost();
    setSelectedPost(currentPost);
    setFinishPostModal(true);
  };

  const closeFinishModal = () => {
    resetFinish();
    setConfirmRequest(false);
    setFinishPostModal(false);
  }

  const showPost = (post : Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const closePost = () => {
    setSelectedPost(null);
    setModalVisible(false);
    setConfirmRequest(false);
  };

  // form layouts using react hook forms and zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetCreate
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema)
  });

  const {
    register: registerFinish,
    handleSubmit: handleSubmitFinish,
    formState: { errors: errorsFinish },
    reset: resetFinish
  } = useForm<FinishedPostSchema>({
    resolver: zodResolver(finishedPostSchema)
  });

  const onSubmit: SubmitHandler<PostSchema> = (data) => {
    if (confirmRequest) {
      setLoading(false);
      createPostTokensFromUser(createPostCreditAmount, data);
    } else {
      if (data.type === "short") {
        setCreatePostCreditAmount(5);
      } else {
        setCreatePostCreditAmount(10)
      }
      setConfirmRequest(true);
    }
  };

  const onSubmitUpdate: SubmitHandler<PostSchema> = (data) => {
    updatePost(data);
  };

  const onSubmitFinish: SubmitHandler<FinishedPostSchema> = (data) => {
    if (confirmRequest) {
      completePost(data, selectedPost?.type);
    } else {
      setConfirmRequest(true);
    }
  }

  async function getProfileImage(authID: string) {
    if (avatarUrlList[authID]) {
      // If the image URL is already in the state, return it.
      return avatarUrlList[authID];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', authID)
        .single();

      if (error) {
        console.warn(error);
        return '';
      }

      const imageUrl = await downloadImage(data?.avatar_url);

      return imageUrl;
    } catch (error) {
      console.log('Error fetching profile image: ', error);
      return '';
    }
  };

  async function getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select();
    
    if (error) {
      console.warn(error);
    };

    setPostData(data as Post[]);
  };

  async function _getUserIdFromId(postUserId : string) {
    const { data } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', postUserId)

    if (data) {
      return data[0].user_id;
    }
  }

  async function createPost(postData: any) {
    const { user } = session;

    // to get full name of user making post
    const { data } = await supabase
      .from('profiles')
      .select("full_name")
      .eq('id', session?.user.id)
      .single();

    const updates = {
      id: user.id,
      created_by: data?.full_name,
      date_created: new Date(),
      type: postData.type,
      description: postData.description,
      contact: postData.contact,
      updated_at: new Date(),
      title: postData.title,
      status: "free"
    };

    const { error } = await supabase.from('posts').insert(updates);

    if (error) {
      alert(error.message)
    };

    setLoading(false);
    toast.success('Post has been created.');
    setConfirmRequest(false);
    closeModal();
  };

  async function updatePost(data : any) {
    setLoading(true);
    
    const updates = {
      type: data.type,
      description: data.description,
      contact: data.contact,
      updated_at: new Date(),
      title: data.title
    };

    try {
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('post_id', selectedPost?.post_id);

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      alert(error);
    };

    setLoading(false);
    toast.success('Post has been updated.');
    closeUpdateModal();
  };

  async function deletePost() {
    setLoading(true);

    try {
      const { error } = await supabase
      .from('posts')
      .delete()
      .eq('post_id', selectedPost?.post_id);

      if (error) {
        alert(error.message);
      };
    } catch (error) {
      alert(error);
    }

    setLoading(false);
    toast.success('Post has been deleted.');
    closeDeletePostModal();
  };

  async function requestPost() {
    if (confirmRequest) {
      const { user } = session;

      // get user's name from id and put it into profile
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)

      const updates = {
        assigned_to_name: data?.[0]?.full_name,
        assigned_to: user.id,
        status: "accepted"
      };

      try {
        const { error } = await supabase
          .from('posts')
          .update(updates)
          .eq('post_id', selectedPost?.post_id);

        if (error) {
          alert(error.message);
        }
      } catch (error) {
        alert(error);
      };
      setConfirmRequest(false);
      closePost();

      toast.success('Post has been requested.') 

    } else {
      setConfirmRequest(true);
    }
  };

  async function cancelAcceptedRequest() {
    if (confirmRequest) {
      const updates = {
        assigned_to_name: null,
        assigned_to: null,
        status: "free"
      };

      try {
        const { error } = await supabase
          .from('posts')
          .update(updates)
          .eq('post_id', selectedPost?.post_id);

        if (error) {
          alert(error.message);
        };
      } catch (error) {
        alert(error);
      };

      setConfirmRequest(false);
      toast.success("Post has been unassigned.")
      closeAcceptedPost();
    } else {
      setConfirmRequest(true);
    }
  };

  const getUserIdFromId = async (postUserId: string) => {
    const userId = await _getUserIdFromId(postUserId);
    return userId;
  }

  async function completePost(data : { time: string; amountPeople: string; rating: string; }, postType : any) {
    setLoading(true);
    const adminPrivateKey = import.meta.env.VITE_ADMIN_PRIVATE_KEY;
    const adminWallet = new ethers.Wallet(adminPrivateKey);
    const signer = adminWallet.connect(provider?.provider);

    const nodeManagerContract = createInstance(signer);
    const traceCreditContract = createTraceInstance(signer);

    const senderAddress = await getPublicKey(selectedPost?.id);
    const receiverAddress = await getPublicKey(selectedPost?.assigned_to!);
    const creditAmountNode = calculateCredit(data, postType);
    const creditAmountTrace = BigInt(creditAmountNode) * (10n ** 18n);
    const postId = selectedPost?.post_id;

    const creditTransaction = await traceCreditContract.transfer(receiverAddress, creditAmountTrace)
    await creditTransaction.wait();
    console.log(creditTransaction);
    const nodeTransaction = await nodeManagerContract.createNode(postId, senderAddress, receiverAddress, creditAmountNode, data.time, data.amountPeople);
    console.log(nodeTransaction);
    
    // update post in database
    const updates = {
      date_finished: new Date(),
      rating: data.rating,
      status: "completed"
    };

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('post_id', selectedPost?.post_id);

    if (error) {
      alert(error.message);
    };

    setConfirmRequest(false);
    setLoading(false);
    toast.success(`Post ${selectedPost?.post_id} has been completed! Your funds will shortly arrive.`);
    setFinishPostModal(false);
  };

  async function fetchNode(nodeNumber : number) {
    const nodeManagerContract = createInstance(provider);
    const [sender, receiver, creditAmount, hoursWorked, amountOfPeople] = await nodeManagerContract.getNodeDetails(nodeNumber);
    const credit = creditAmount.toString();
    const hours = hoursWorked.toString();
    const people = amountOfPeople.toString();
    console.log(credit);

    setNodeDetails({
      creditAmount: credit,
      hoursWorked: hours,
      amountOfPeople: people
    });
  }

  const findDetailsAboutCompletePost = () => {
    setShowDetailsAboutCompletePost(true);
    const nodeNumber = selectedPost?.post_id;
    if (nodeNumber) {
      fetchNode(nodeNumber);
    };
  }

  const openDeletePostModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeletePostModal = () => {
    setIsDeleteModalOpen(false);
  };

  const createPostTokensFromUser = async (creditAmount : number, data : any) => {
    const PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY;
    const adminWallet = new ethers.Wallet(PRIVATE_KEY);
    const adminSigner = adminWallet.connect(provider?.provider);

    const receiverKey = await getPrivateKey(session?.user.id);
    const receiverWallet = new ethers.Wallet(receiverKey);
    const receiverSigner = receiverWallet.connect(provider?.provider);

    const baseAmount = BigInt(creditAmount) * (10n ** 18n);
    const contract = createTraceInstance(receiverSigner);

    // Check if credit balance of user is enough first
    const balanceInBigInt = await contract.balanceOf(receiverWallet.address);
    const balanceInNumber = parseInt(balanceInBigInt.toString()) / DECIMALS;
    
    if (balanceInNumber < creditAmount) {
      // Call closeModal here to close create post modal
      closeModal();
      toast.error(`You need ${creditAmount} credits to make this post.`);
      setLoading(false);
      return;
    }

    // If balance is enough, transfer some funds from admin wallet to receiver wallet for transaction
    const transactionEth = await adminSigner.sendTransaction({
      to: receiverWallet.address,
      value: ethers.parseEther("0.01")
    });

    await transactionEth.wait();
    console.log(transactionEth);  

    const transaction = await contract.transfer(adminWallet.address, baseAmount);
    console.log(transaction);

    createPost(data);
  }
  
  useEffect(() => {
    // User can only view posts if logged in
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
    
    getPosts();

    // Fetch profile images for each post
    if (postData) {
      postData.forEach(async (post) => {
        const imageUrl = await getProfileImage(post.id);
        setAvatarUrlList((prevImages : Record<string, string>) => ({
          ...prevImages,
          [post.id]: imageUrl || '',
        }));
      });
    }

    // Set each feature so that the no posts show independently
    if (postData) {
      setFilteredAvailablePosts(postData.filter(post => {
        const createdByMatch = post.created_by.toLowerCase().includes(searchTerm.toLowerCase());
        const assignedToNameExists = post.assigned_to_name && post.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        return createdByMatch || assignedToNameExists || titleMatch;
      }));
      
      setFilteredPersonalPosts(postData.filter(post => {
        const createdByMatch = post.created_by.toLowerCase().includes(searchTerm.toLowerCase());
        const assignedToNameExists = post.assigned_to_name && post.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        return createdByMatch || assignedToNameExists || titleMatch;
      }));
      
      setFilteredCompletePosts(postData.filter(post => {
        const createdByMatch = post.created_by.toLowerCase().includes(searchTerm.toLowerCase());
        const assignedToNameExists = post.assigned_to_name && post.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        return createdByMatch || assignedToNameExists || titleMatch;
      }));
    }

    // get url links for each post creator
    if (selectedPost !== null) {
      const fetchUserId = async () => {
        const userId = await getUserIdFromId(selectedPost.id);
        setUserId(userId);
      };
  
      fetchUserId();
    }
  }, [session, postData, navigate, selectedPost]);

  return (
    <div className="w-[70vw] m-auto mt-12 mb-12">
      <div>

        <div className="flex flex-row justify-between mb-2">
          <h1 className="text-sm tracking-wider text-[#1f2421] font-bold uppercase my-2">Dashboard</h1>
          <button type="submit" 
            className="px-8 bg-[#49A078] py-2 rounded-md font-bold text-white hover:bg-[#3e7d5a] transition duration-300"
            onClick={openModal}>
            <i className="fa-regular fa-square-plus mr-2"/>Create
          </button>
        </div>

        {showTutorial ? (
          <i className="fa-regular fa-eye cursor-pointer text-2xl mb-4" onClick={() => setShowTutorial(false)} />
        ) : (
          <i className="fa-regular fa-eye-slash cursor-pointer text-2xl mb-4" onClick={() => setShowTutorial(true)} />
        )}

        {showTutorial && (
          <div>
            <h1 className="text-lg uppercase font-bold mb-4">Tutorial</h1>
            <ul className="list-disc list-inside pl-2 mb-6 mt-2 text-lg">
              <li className="mb-2">To create posts, you can use your account's credits.</li>
              <li className="mb-2">To gain credit, you can assign yourself to an available post.</li>
              <ul className="list-disc list-inside pl-4">
                <li className="mb-2 text-red-600">Make sure to contact the person first before requesting!</li>
                <li className="mb-2">Only the creator of the post can finish the job.</li>
                <li className="mb-2">When you finish a post, it may take a while for credit to show up in your account.</li>
              </ul>
              <li className="mb-2">You can filter certain posts using the tabs below or by searching.</li>
              <ul className="list-disc list-inside pl-4">
                <li className="mb-2">You can view the details of a finished post through clicking one and requesting info about it.</li>
              </ul>
              <li className="mb-2">You can hide this section by clicking the eye icon above.</li>
            </ul>
          </div>
        )}

        <div className="flex md:flex-row flex-col sm:flex-wrap pt-1 pb-5 gap-5">
          <DashboardPostTypeItem title="Total" icon="fas fa-globe" number={`${postData.length}`}
            onColor={`${(viewAvailablePosts && viewCompletePosts && viewPersonalPosts) ? "bg-[#41b87e] border-black border-2 shadow-xl shadow-slate-500" : "bg-[#67c698]"} 
            hover:bg-[#41b87e]`} 
            onClickFunction={showTotalPosts}/>
          <DashboardPostTypeItem title="Available" icon="fa-solid fa-person-circle-plus" number={`${postData.filter(post => post.status === "free").length}`} 
            onColor={`${viewAvailablePosts && !viewCompletePosts && !viewPersonalPosts ? "bg-[#ffcc4a] border-black border-2 shadow-xl shadow-slate-500" : "bg-[#ffd66e]"} 
            hover:bg-[#ffcc4a]`} 
            onClickFunction={showAvailablePosts}/>
          <DashboardPostTypeItem title="Completed" icon="fa-solid fa-handshake" number={`${postData.filter(post => post.status === "completed").length}`} 
            onColor={`${!viewAvailablePosts && viewCompletePosts && !viewPersonalPosts ? "bg-[#c17fd0] border-black border-2 shadow-xl shadow-slate-500" : "bg-[#cd99d9]"} 
            hover:bg-[#c17fd0]`} 
            onClickFunction={showCompletedPosts}/>
          <DashboardPostTypeItem title="Personal" icon="fa-solid fa-user" number={`${postData.filter(post => post.assigned_to === session?.user.id || post.id === session?.user.id).length}`} 
            onColor={`${!viewAvailablePosts && !viewCompletePosts && viewPersonalPosts ? "bg-[#a2b0c1] border-black border-2 shadow-xl shadow-slate-500" : "bg-[#b6c6d9]"} 
            hover:bg-[#a2b0c1]`} 
            onClickFunction={showPersonalPosts}/>
        </div>

        <div className="mt-12 relative">
          <i className="fa-solid fa-magnifying-glass absolute p-5 opacity-50"/>
          <input type="search" className="border-black border-2 w-full p-4 pl-12 rounded-md" 
            placeholder="Search for posts" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>

      </div>

      {/* Free posts */}
      {viewAvailablePosts && (
      <div className="mt-12">
        <h1 className="text-sm uppercase text-[#1f2421] font-bold py-4 border-b-black border-b-2 tracking-wider mt-8">Available Posts</h1>
        <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAvailablePosts.length > 0 ? (
            filteredAvailablePosts.map((post) => (
              post.status === "free" && (
                <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-[#2c6048] hover:shadow-slate-500 cursor-pointer" 
                  key={post.post_id} onClick={() => showPost(post)}>
                  <div className="flex md:flex-row flex-col">
                    <img className="w-20 h-20 object-cover rounded-full m-4" src={avatarUrlList[post.id]}/>
                    <div>
                      <h2 className="text-3xl text-[#2c6048] p-4 mr-2">{truncateText(post.title, 60)}</h2>
                      <p className="text-sm text-gray-500 pl-4 mr-2">{post.created_by} | {post.date_created.toLocaleString()}</p>
                    </div>
                  </div>  
                  <div className="p-4 flex items-center">
                    <div>
                      <p className="text-lg text-[#1f2421]">{truncateText(post.description, 150)}</p>
                      
                      {/* Only render these icons if the posts are the users */}
                      {post.id === session?.user.id && (
                        <div>
                          <i className="fa-regular fa-pen-to-square text-[#49A078] hover:font-bold pr-4 text-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                              openUpdateModal()}}></i>
                          <i className="text-red-500 fa-regular fa-trash-can hover:font-bold text-xl"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPost(post);
                              openDeletePostModal()}}></i>
                        </div>
                      )}
                    </div>

                    {isDeleteModalOpen && (
                      <div onClick={(e) => {
                        e.stopPropagation()}}
                        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col md:h-auto h-[100%]">
                          <h1 className="text-xl mb-4">Are you sure you want to <b>delete</b> this post?</h1>
                          <div className="flex flex-row w-full sm:space-x-2 mt-auto space-x-2">
                            <button className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300"
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeDeletePostModal()}}>
                              Cancel
                            </button>
                            <button className={`w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost()}}>
                              {loading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))
          ) : (
            <NoPostsFound/>
          )}

          {/* Modal for showing currently clicked free post */}
          {isModalVisible && selectedPost && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col md:h-auto h-[100%]">
                <div className="flex flex-row">
                  <div>
                    <h2 className="text-4xl text-[#2c6048] font-semibold mb-2 pr-4">{selectedPost.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">{capitalize(selectedPost.type)} | {selectedPost.date_created.toLocaleString()} | {selectedPost.post_id} </p>
                  </div>
                  <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closePost}>
                    &times;
                  </span>
                </div>
                
                <p className="text-lg text-[#1f2421] mb-4 break-words">{selectedPost.description}</p>

                <div className="flex items-center mb-4">
                  <i className="fa-solid fa-phone text-[#2c6048] mr-2"></i>
                  <p className="text-[#2c6048] font-semibold mr-2">{selectedPost.contact} |</p>
                  <i className="fa-solid fa-user text-[#2c6048] mr-2"></i>
                  <Link to={`/account/${userId}`} className="text-md font-bold text-[#2c6048] hover:underline hover:underline-offset-2">{selectedPost.created_by} </Link>
                </div>

                <h2 className="text-lg mb-4 font-bold text-red-500">
                  {/* Set it so you can't be worker of own post */}
                  {confirmRequest ? "Please make sure to contact the creator of this post first to sort out any details before requesting!" : "" }
                </h2>
                
                {/* Modal buttons */}
                <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                  <button onClick={closePost} className="w-full sm:w-[50%] cancel-button">
                    Cancel
                  </button>
                  {(selectedPost.id === session?.user.id) ? (
                    <button className="w-full sm:w-[50%] confirm-button" disabled={true}>
                      You can't accept your own post
                    </button>
                  ) : (
                    <button onClick={requestPost} className="w-full sm:w-[50%] confirm-button">
                      {confirmRequest ? "Confirm" : "Request"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div> 
      </div>
      )}

      {/* Personal Posts */}
      {viewPersonalPosts && (
        <div className="mt-12">
          <h1 className="text-sm uppercase text-[#1f2421] font-bold py-4 tracking-wider border-b-black border-b-2">Personal Posts</h1>
          
          <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPersonalPosts.length > 0 ? (
              filteredPersonalPosts.map((post) => (
                (post.id === session?.user.id || post.assigned_to === session?.user.id) && (
                  <div className="rounded-xl shadow-2xl border-2 border-[#2c6048] hover:shadow-slate-500 cursor-pointer" 
                    key={post.post_id}  onClick={() => showAcceptedPost(post)}>
                    <div className="flex md:flex-row flex-col">
                      <img className="w-20 h-20 object-cover rounded-full m-4" src={avatarUrlList[post.id]}/>
                      <div>
                        <h2 className="text-3xl text-[#2c6048] p-4 mr-2">{truncateText(post.title, 60)}</h2>
                        <p className="text-sm text-gray-500 pl-4 mr-2">{post.created_by} | {post.date_created.toLocaleString()}</p>
                      </div>
                    </div>  
                    <div className="p-4 flex items-center" >
                      <div className="overflow-hidden">
                        <p className="text-lg text-[#1f2421] break-words">{truncateText(post.description, 150)}</p>
                        
                        {/* Only render these icons if the posts are the users */}
                        {post.id === session.user.id && (
                          <div>
                            <i className="fa-regular fa-pen-to-square text-[#49A078] hover:font-bold pr-4 text-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost(post);
                                openUpdateModal()}}></i>
                            <i className="text-red-500 fa-regular fa-trash-can hover:font-bold text-xl"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPost(post);
                                openDeletePostModal()}}></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))
            ) : (
              <NoPostsFound/>
            )}
          </div>
        </div>
      )}


      {/* Only shows completed posts */}
      {viewCompletePosts && (
        <div className="mt-12">
          <h1 className="text-sm text-[#1f2421] font-bold py-4 border-b-black border-b-2 uppercase tracking-wider">Completed Posts</h1>

          <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCompletePosts.length > 0 ? (
              filteredCompletePosts.map((post) => (
                post.status === "completed" && (
                  <div className="rounded-xl shadow-2xl border-2 border-[#2c6048] hover:shadow-slate-500 cursor-pointer" 
                    key={post.post_id}  onClick={() => openCompleteModal(post)}>
                    <div className="flex md:flex-row flex-col">
                      <img className="w-20 h-20 object-cover rounded-full m-4" src={avatarUrlList[post.id]}/>
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
                    <p className="px-4 pb-3 text-[#1f2421] break-words">Completed by: {post.assigned_to_name}</p>
                  </div>
                )
              ))
            ) : (
              <NoPostsFound/>
            )}
          </div>
        </div>
      )}


      {/* Post Modal for finished posts */}
      {completePostModal && selectedPost && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col md:h-auto h-[100%]">
            <div className="flex flex-row">
              <div>
                <h2 className="text-4xl text-[#2c6048] font-semibold mb-2 pr-4">{selectedPost.title}</h2>
                <p className="text-sm text-gray-600 mb-4">{capitalize(selectedPost.type)} | {selectedPost.date_created.toLocaleString()} | {selectedPost.post_id} </p>
              </div>
              
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeCompleteModal}>
                &times;
              </span>
            </div>
            
            <p className="text-lg text-[#1f2421] mb-4 break-words">{selectedPost.description}</p>
            
            <div className="flex items-center mb-4">
              <i className="fa-solid fa-phone text-[#2c6048] mr-2"></i>
              <p className="text-[#2c6048] font-semibold mr-2">{selectedPost.contact} |</p>
              <i className="fa-solid fa-user text-[#2c6048] mr-2"></i>
              <Link to={`/account/${userId}`} className="text-md font-bold text-[#2c6048] hover:underline hover:underline-offset-2">{selectedPost.created_by} </Link>
            </div>

            {showDetailsAboutCompletePost && (
              <div className="mb-4 flex flex-col">
                <div className="flex flex-row">
                  <i className="fa-brands fa-ethereum text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.creditAmount} credits</h1>
                </div>
                <div className="flex flex-row">
                  <i className="fa-regular fa-clock text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.hoursWorked} hours</h1>
                </div>
                <div className="flex flex-row">
                  <i className="fa-solid fa-user-group text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.amountOfPeople} people</h1>
                </div>
              </div>
            )}

            <div className="mb-4">
              <a className="text-md">Completed by: <b>{selectedPost.assigned_to_name} on {selectedPost.date_finished.toLocaleString()}</b></a>
            </div>

            {/* Modal buttons */}
            <div className="flex flex-row w-full sm:space-x-2 mt-auto">
              <button onClick={closeCompleteModal} className="w-full sm:w-[50%] cancel-button">
                Close
              </button>
              <button onClick={findDetailsAboutCompletePost} className="w-full sm:w-[50%] confirm-button">
                Show details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal for accepted posts */}
      {isRequestModalOpen && selectedPost && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col md:h-auto h-[100%]">
            <div className="flex flex-row">
              <div>
                <h2 className="text-4xl text-[#2c6048] font-semibold mb-2 pr-4">{selectedPost.title}</h2>
                <p className="text-sm text-gray-600 mb-4">{capitalize(selectedPost.type)} | {selectedPost.date_created.toLocaleString()} | {selectedPost.post_id} </p>
              </div>
              
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeAcceptedPost}>
                &times;
              </span>
            </div>
            
            <p className="text-lg text-[#1f2421] mb-4 break-words">{selectedPost.description}</p>
            
            <div className="flex items-center mb-4">
              <i className="fa-solid fa-phone text-[#2c6048] mr-2"></i>
              <p className="text-[#2c6048] font-semibold mr-2">{selectedPost.contact} |</p>
              <i className="fa-solid fa-user text-[#2c6048] mr-2"></i>
              <Link to={`/account/${userId}`} className="text-md font-bold text-[#2c6048] hover:underline hover:underline-offset-2">{selectedPost.created_by} </Link>
            </div>

            {showDetailsAboutCompletePost && (
              <div className="mb-4 flex flex-col">
                <div className="flex flex-row">
                  <i className="fa-brands fa-ethereum text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.creditAmount} credits</h1>
                </div>
                <div className="flex flex-row">
                  <i className="fa-regular fa-clock text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.hoursWorked} hours</h1>
                </div>
                <div className="flex flex-row">
                  <i className="fa-solid fa-user-group text-xl mr-4"/><h1 className="text-lg pb-3">{nodeDetails.amountOfPeople} people</h1>
                </div>
              </div>
            )}

            <div className="mb-4">
              {selectedPost.status === "completed" && (
                <a className="text-md">Completed by: <b>{selectedPost.assigned_to_name} on {selectedPost.date_finished.toLocaleString()}</b></a>
              )}
              {selectedPost.status === "accepted" && (
                <a className="text-md">Assigned To: <b>{selectedPost.assigned_to_name}</b></a>
              )}
            </div>

            {selectedPost.id !== session?.user.id && (
              <h2 className="text-lg mb-4 font-bold text-red-500">
                {confirmRequest ? "Are you sure you want to cancel this work? You won't receive the full amount of credits." : "" }
              </h2>
            )}

            {selectedPost.id === session?.user.id && (
              <h2 className="text-lg mb-4 font-bold text-red-500">
                {confirmRequest ? "Are you sure you want to cancel this work? The volunteer won't receive the full amount of credits." : "" }
              </h2>
            )}
            
            {/* Modal buttons */}
            <div className={`flex ${selectedPost.id === session?.user.id ? 'flex-row' : 'flex-col'} space-y-2 sm:space-y-0 sm:space-x-2 mt-auto`}>
             
              {/* Only creator of post can finish it */}
              {selectedPost.status === "accepted" && selectedPost.id === session?.user.id && (
                <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                  <button onClick={cancelAcceptedRequest}
                    className="w-full sm:w-[50%] cancel-button">
                    Cancel Work
                  </button>
                  <button onClick={openFinishModal}
                    className="w-full sm:w-[50%] confirm-button">
                    Finish Work
                  </button>
                </div>
              )}

              {/* If user isn't the creator of an post but assigned to one */}
              {selectedPost.status === "accepted" && selectedPost.id !== session?.user.id && (
                <button onClick={cancelAcceptedRequest}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                  Cancel Work
               </button>
              )}

              {/* If user has any completed posts */}
              {selectedPost.status === "completed" && (
                <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                  <button onClick={closeCompleteModal} className="w-full sm:w-[50%] cancel-button">
                    Close
                  </button>
                  <button onClick={findDetailsAboutCompletePost} className="w-full sm:w-[50%] confirm-button">
                    Show details
                  </button>
                </div>
              )}

              {/* If user has any free posts */}
              {selectedPost.status === "free" && (
                <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                  <button onClick={closePost} className="w-full sm:w-[50%] cancel-button">
                    Cancel
                  </button>
                  {(selectedPost.id === session?.user.id) ? (
                    <button className="w-full sm:w-[50%] confirm-button" disabled={true}>
                      You can't accept your own post
                    </button>
                  ) : (
                    <button onClick={requestPost} className="w-full sm:w-[50%] confirm-button">
                      {confirmRequest ? "Confirm" : "Request"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for finishing the post */}
      {finishPostModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col h-[50%] md:h-auto">
            <div className="flex flex-row">
              <h1 className="text-3xl my-2 pb-2">Complete Work</h1>
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeFinishModal}>
                &times;
              </span>
            </div>

            <form onSubmit={handleSubmitFinish(onSubmitFinish)} className="flex flex-col h-full space-y-4">

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Number of hours</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="hours"
                  placeholder="Enter the number of hours that the volunteer worked for."
                  {...registerFinish("time")}
                />
                {errorsFinish.time && ( 
                  <p className="text-sm text-red-500 mt-2"> {errorsFinish.time?.message}</p> 
                )}
              </div>
              
              <div>
                <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-1">Number of people</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="people"
                  placeholder="Enter the number of people involved (excluding volunteer)."
                  {...registerFinish("amountPeople")}
                />
                {errorsFinish.amountPeople && ( 
                  <p className="text-sm text-red-500 mt-2"> {errorsFinish.amountPeople?.message}</p> 
                )}
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]" id="rating" defaultValue="Please select a value"
                  {...registerFinish("rating")}>
                  <option value="No rating">Please select a value</option>
                  <option value="5">5</option>  
                  <option value="4">4</option>   
                  <option value="3">3</option>   
                  <option value="2">2</option>   
                  <option value="1">1</option> 
                </select>
                {errorsFinish.rating && ( 
                  <p className="text-sm text-red-500 mt-2"> {errorsFinish.rating?.message}</p> 
                )}
              </div>

              <h2 className="text-lg mb-4 font-bold text-red-500">
                {/* Set it so you can't be creator of own post */}
                {confirmRequest ? "Make sure all the details are correct. You won't be able to change them afterwards!" : "" }
              </h2>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto pt-2">
                <button onClick={closeFinishModal} className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 mr-4">
                  Cancel
                </button>
                {/* HELP, make all buttons disabled when clicked once using loading */}
                <button type="submit" 
                  className={`w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300 ml-4 ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                  disabled={loading}>
                  {loading ? 'Completing...' : 'Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal for creating posts */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col h-auto">
            <div className="flex flex-row">
              <h1 className="text-3xl my-2 pb-2">Create Post</h1>
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeModal}>
                &times;
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full space-y-4">

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="title"
                  placeholder="Enter a suitable title for the post"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-2"> {errors.title?.message}</p> 
                )}
              </div>

              <div>
                <label htmlFor="types" className="block text-sm font-medium text-gray-700 mb-1">Type of Work</label>
                <select id="types" className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421] bg-white cursor-pointer"
                  {...register("type")}>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500 mt-2"> {errors.type?.message}</p> 
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Post Description</label>
                <textarea
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="description"
                  placeholder="Enter a suitable description for the task."
                  rows={10}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-2"> {errors.description?.message}</p> 
                )}
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="contact"
                  placeholder="Enter an email or phone number to contact you."
                  {...register("contact")}
                />
                {errors.contact && (
                  <p className="text-sm text-red-500 mt-2"> {errors.contact?.message}</p> 
                )}
              </div>

              <h2 className="text-lg mb-4 font-bold text-red-500">
                {/* Tell user how many credits are needed for posts */}
                {confirmRequest ? `You need ${createPostCreditAmount} credits to make this post. Are you sure?` : "" }
              </h2>

              <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                <button onClick={closeModal} className="w-full sm:w-[50%] cancel-button"
                  disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className={`w-full sm:w-[50%] bg-[#49A078] confirm-button ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
                  disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form for updating the post */}
      {isUpdateModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] flex flex-col h-auto">
            <div className="flex flex-row">
              <h1 className="text-3xl my-2 pb-2">Update Post</h1>
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeUpdateModal}>
                &times;
              </span>
            </div>
            
            <form onSubmit={handleSubmitUpdate(onSubmitUpdate)} className="flex flex-col h-full space-y-4">

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Post Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="title"
                  placeholder="Enter a suitable title for the post"
                  {...registerUpdate("title")}
                  defaultValue={selectedPost?.title}
                />
                {errorsUpdate.title && (
                  <p className="text-sm text-red-500 mt-2"> {errorsUpdate.title?.message}</p> 
                )}
              </div>

              <div>
                <label htmlFor="types" className="block text-sm font-medium text-gray-700">Type of Work</label>
                <select id="types" className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421] bg-white cursor-pointer"
                  {...registerUpdate("type")} defaultValue={selectedPost?.type}>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
                {errorsUpdate.type && (
                  <p className="text-sm text-red-500 mt-2"> {errorsUpdate.type?.message}</p> 
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Post Description</label>
                <textarea
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="description"
                  placeholder="Enter a suitable description for the task."
                  rows={10}
                  {...registerUpdate("description")}
                  defaultValue={selectedPost?.description}
                />
                {errorsUpdate.description && (
                  <p className="text-sm text-red-500 mt-2"> {errorsUpdate.description?.message}</p> 
                )}
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Info</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
                  id="contact"
                  placeholder="Enter an email or phone number to contact you."
                  {...registerUpdate("contact")}
                  defaultValue={selectedPost?.contact}
                />
                {errorsUpdate.contact && (
                  <p className="text-sm text-red-500 mt-2"> {errorsUpdate.contact?.message}</p> 
                )}
              </div>

              <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                <button onClick={closeUpdateModal} className="w-full sm:w-[50%] cancel-button"
                  disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="w-full sm:w-[50%] bg-[#49A078] confirm-button"
                  disabled={loading}>
                  {confirmRequest ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardInfo;