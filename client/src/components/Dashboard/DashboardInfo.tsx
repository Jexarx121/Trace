import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { postSchema } from ".";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { LINKS } from "../constants";
import { Post } from "./Posts";
import { truncateText } from "../../helpers/functions";

type PostSchema = z.infer<typeof postSchema>;

const DashboardInfo = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session;

  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<Post[]>([]);
  const [avatarUrlList, setAvatarUrlList] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showAcceptedPost = (post : Post) => {
    setSelectedPost(post);
    setIsRequestModalOpen(true);
  };

  const closeAcceptedPost = () => {
    setSelectedPost(null);
    setIsRequestModalOpen(false);
  }

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const showPost = (post : Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const closePost = () => {
    setSelectedPost(null);
    setModalVisible(false);
    setConfirmRequest(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate }
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema)
  });

  const onSubmit: SubmitHandler<PostSchema> = (data) => {
    createPost(data);
  };

  const onSubmitUpdate: SubmitHandler<PostSchema> = (data) => {
    updatePost(data);
  };

  const goToLogin = () => {
    navigate(LINKS.LOGIN);
  };

  async function downloadImage(path : string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      };
      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.log('Error downloading image: ', error);
    };   
  };

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

  useEffect(() => {
    // User can only view posts if logged in
    if (!session) {
      goToLogin();
    };

    getPosts();

    // Fetch profile images for each post
    postData.forEach(async (post) => {
      const imageUrl = await getProfileImage(post.id);
      setAvatarUrlList((prevImages : Record<string, string>) => ({
        ...prevImages,
        [post.id]: imageUrl || '',
      }));
    });
  }, [session, postData]); // Add postData as a dependency

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

    // refresh the page
    navigate(0);
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
    navigate(0);
  };

  async function deletePost() {
    setLoading(false);

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

    setLoading(true);
    closeDeletePostModal();

    // refresh the page
    navigate(0);
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
        assigned_to_name: data[0].full_name,
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

      // put in flash alert to indicate post has been requested

      // refresh page
      navigate(0);
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
      closeAcceptedPost();

      // refresh page
      navigate(0);
    } else {
      setConfirmRequest(true);
    }
  };

  async function finishPost() {
    console.log("test");
  };

  const openDeletePostModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeletePostModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-[70vw] m-auto mt-12 mb-12">

      {/* Accepted Posts */}
      <div className="mt-12">
        <div className="flex flex-row">
          <h1 className="text-4xl font-bold mb-4">Accepted Work</h1>
          <button type="submit" 
            className="ml-auto px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center mb-4 text-white hover:bg-[#3e7d5a] transition duration-300"
            onClick={openModal}>
            <i className="fa-regular fa-square-plus mr-2"/>Create Post
          </button>
        </div>
        
        {postData.map((post) => (
          post.status === "accepted" && (
            <div className="my-6 rounded-xl shadow-2xl border-2 border-[#2c6048] bg-white hover:shadow-slate-500 cursor-pointer" 
              key={post.post_id}  onClick={() => showAcceptedPost(post)}>
              <div className="flex md:flex-row flex-col">
                <img className="w-20 h-20 object-cover rounded-full m-4" src={avatarUrlList[post.id]}/>
                <div>
                  <h2 className="text-3xl text-[#2c6048] p-4 mr-2">{truncateText(post.title, 60)}</h2>
                  <p className="text-sm text-gray-500 pl-4 mr-2">{post.created_by} | {post.date_created.toLocaleString()}</p>
                </div>
              </div>  
              <div className="p-4 flex items-center" >
                <div>
                  <p className="text-lg text-[#1f2421]">{truncateText(post.description, 150)}</p>
                  
                  {/* Only render these icons if the posts are the users */}
                  {post.id === session.user.id && (
                    <div>
                      <i className="fa-regular fa-pen-to-square text-[#49A078] hover:font-bold pr-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                          openUpdateModal()}}></i>
                      <i className="text-red-500 fa-regular fa-trash-can hover:font-bold"
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
        ))}
      </div>

      {/* Post Modal for accepted posts */}
      {isRequestModalOpen && selectedPost && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[30%] flex flex-col h-full md:h-auto">
            <div className="flex flex-row">
              <h2 className="text-4xl text-[#2c6048] font-semibold mb-4">{selectedPost.title}</h2>
              <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closeAcceptedPost}>
                &times;
              </span>
            </div>
            
            <p className="text-lg text-[#1f2421] mb-4">{selectedPost.description}</p>

            <div className="flex items-center mb-4">
              <i className="fa-solid fa-phone text-[#2c6048] mr-2"></i>
              <p className="text-[#2c6048] font-semibold">{selectedPost.contact}</p>
            </div>

            <div className="flex items-center mb-4">
              <i className="fa-regular fa-user text-gray-600 mr-2"></i>
              <p className="text-md font-bold text-gray-600">{selectedPost.created_by} | {selectedPost.date_created.toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <a className="text-md">Assigned To: <b>{selectedPost.assigned_to_name}</b></a>
            </div>

            {selectedPost.id !== session.user.id && (
              <h2 className="text-lg mb-4 font-bold text-red-500">
                {confirmRequest ? "Are you sure you want to cancel this work? You won't receive the full amount of credits." : "" }</h2>
            )}

            {selectedPost.id === session.user.id && (
              <h2 className="text-lg mb-4 font-bold text-red-500">
              {confirmRequest ? "Are you sure you want to cancel this work? The volunteer won't receive the full amount of credits." : "" }</h2>
            )}
            
            {/* Modal buttons */}
            <div className={`flex ${selectedPost.id === session.user.id ? 'flex-row' : 'flex-col'} space-y-2 sm:space-y-0 sm:space-x-2 mt-auto`}>
              {selectedPost.id !== session.user.id && (
                <button onClick={cancelAcceptedRequest}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                  Cancel Work
                </button>
              )}
              {selectedPost.id === session.user.id && (
                <div className="flex flex-row w-full sm:space-x-2 mt-auto">
                  <button onClick={cancelAcceptedRequest}
                    className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                    Cancel Work
                  </button>
                  <button className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300">
                    Finish Work
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Free posts */}
      <div className="mt-12">
        <h1 className="text-4xl font-bold mb-4">Available Work</h1>
        {postData.map((post) => (
          post.status === "free" && (
            <div className="my-6 rounded-xl overflow-hidden shadow-2xl border-2 border-[#2c6048] bg-white hover:shadow-slate-500 cursor-pointer" 
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
                  {post.id === session.user.id && (
                    <div>
                      <i className="fa-regular fa-pen-to-square text-[#49A078] hover:font-bold pr-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                          openUpdateModal()}}></i>
                      <i className="text-red-500 fa-regular fa-trash-can hover:font-bold"
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
                    <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[30%] flex flex-col h-full md:h-auto">
                      <h1 className="text-xl mb-4">Are you sure you want to <b>delete</b> this post?</h1>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
                        <button className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeDeletePostModal()}}>
                          Cancel
                        </button>
                        <button className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost()}}>
                          {loading ? 'Delete' : 'Deleting...'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ))}

        {/* Modal for showing currently clicked post */}
        {isModalVisible && selectedPost && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[30%] flex flex-col h-full md:h-auto">
              <div className="flex flex-row">
                <h2 className="text-4xl text-[#2c6048] font-semibold mb-4">{selectedPost.title}</h2>
                <span className="cursor-pointer ml-auto text-3xl text-gray-600" onClick={closePost}>
                  &times;
                </span>
              </div>
              
              <p className="text-lg text-[#1f2421] mb-4">{selectedPost.description}</p>

              <div className="flex items-center mb-4">
                <i className="fa-solid fa-phone text-[#2c6048] mr-2"></i>
                <p className="text-[#2c6048] font-semibold">{selectedPost.contact}</p>
              </div>

              <div className="flex items-center mb-4">
                <i className="fa-regular fa-user text-gray-600 mr-2"></i>
                <p className="text-md font-bold text-gray-600">{selectedPost.created_by} | {selectedPost.date_created.toLocaleString()}</p>
              </div>

              <h2 className="text-lg mb-4 font-bold text-red-500">
                {confirmRequest ? "Please make sure to contact the creator of this post first to sort out any details before requesting!" : "" }</h2>
              
              {/* Modal buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
                <button onClick={closePost} className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                  Cancel
                </button>
                <button onClick={requestPost} className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300">
                  {confirmRequest ? "Confirm" : "Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal for creating posts */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[30%] flex flex-col h-full md:h-auto">
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto pt-2">
                <button onClick={closeModal} className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                  Cancel
                </button>
                <button type="submit" className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form for updating the post */}
      {isUpdateModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-[100%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[30%] flex flex-col h-full md:h-auto">
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
                  {...registerUpdate("type")}>
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto pt-2">
                <button onClick={closeUpdateModal} className="w-full sm:w-[50%] bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300">
                  Cancel
                </button>
                <button type="submit" className="w-full sm:w-[50%] bg-[#49A078] text-white py-2 rounded-md hover:bg-[#3e7d5a] transition duration-300">
                  Update
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