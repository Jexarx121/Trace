import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { profileSchema } from ".";
import { supabase } from "../../supabase/supabaseClient";
import { capitalize } from "../../helpers/functions";
import { LINKS } from "../constants";

type ProfileSchema = z.infer<typeof profileSchema>;

const EditAccountForm = () => {
  const [loading, setLoading] = useState(true);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { session, fullName, age, bio, passedAvatarUrl } = location.state || {};

  let firstName;
  let surname;
  let listOfNames;
  if (fullName !== null) {
    listOfNames = fullName.split(' ');
    firstName = listOfNames[0];
    surname = "";

    for (let i=1; i < listOfNames.length; i++) {
      surname += capitalize(listOfNames[i]) + " ";
    };
  };

  const goToAccount = () => {
    navigate(LINKS.ACCOUNT, {state: { session }});
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  });
  
  const handleDescriptionChange = (event : any) => {
    const descriptionValue = event.target.value;
    setDescriptionLength(descriptionValue.length);
  };

  async function uploadAvatar(profileImage : any): Promise<string> {
    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`
      
      const { error : uploadError } = await supabase.storage.from('avatars').upload(filePath, profileImage);

      const newUrl = filePath;

      if (uploadError) {
        throw uploadError;
      }

      return newUrl;

    } catch (error) {
      alert(error);
      return "";
    } 
  };

  async function updatePosts(authId : any, newName: string) {
    const { error } = await supabase
      .from('posts')
      .update({created_by: newName, assigned_to_name: newName})
      .eq('id', authId);

    if (error) {
      alert(error.message);
    };
  };

  async function updateProfile(data : any) {
    setLoading(false);
    const { user } = session;
    const fullname : string = capitalize(data.firstName) + " " + capitalize(data.surname);
    let avatarUrl;

    // Check if user uploaded an image
    if (data.profileImage.length > 0) {
      avatarUrl = await uploadAvatar(data.profileImage[0]);
      console.log(avatarUrl);
    } else if (passedAvatarUrl != "") {
      avatarUrl = passedAvatarUrl;
      console.log(avatarUrl);
    } else {
      avatarUrl = 'defaultImage.png';
    }

    const updates = {
      id: user.id,
      full_name: fullname,
      avatar_url: avatarUrl,
      age: data.age,
      bio: data.bio,
      updated_at: new Date()
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(error.message);
    };

    updatePosts(user.id, fullname);

    setLoading(true);
    goToAccount();
  };

  const onSubmit: SubmitHandler<ProfileSchema> = (data) => {
    updateProfile(data);
  };
  
  return (
    <div>
      <form className="container mx-auto p-4" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <h1 className="text-5xl font-bold text-[#1f2421] mb-4">Edit Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="profileImage" className="block mb-1">Profile Picture</label>
            <input type="file" id="profileImage"
              className="w-full px-3 py-2 border-2 rounded-md mb-2 md:mb-0 border-[#1f2421]" 
              {...register("profileImage")}/>
            {errors.profileImage && (
              <p className="text-sm text-red-500 mt-2"> {errors.profileImage?.message?.toString()}</p> 
            )}
          </div>

          {/* First Name and Surname */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2 lg:w-1/2 pr-2">
                <label htmlFor="firstName" className="block mb-1">First Name</label>
                <input type="text" id="firstName" placeholder="John" defaultValue={firstName} 
                  className="w-full px-3 py-2 border-2 rounded-md mb-2 md:mb-0 border-[#1f2421]" 
                  {...register("firstName")}/>
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-2"> {errors.firstName?.message}</p> 
                )}
              </div>
              
              <div className="w-full md:w-1/2 lg:w-1/2 md:pl-2">
                <label htmlFor="surname" className="block mb-1">Surname</label>
                <input type="text" id="surname" placeholder="Smith" 
                  className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]" defaultValue={surname}
                  {...register("surname")}/>
                {errors.surname && (
                  <p className="text-sm text-red-500 mt-2"> {errors.surname?.message}</p> 
                )}
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="age" className="block mb-2">Age</label>
            <input type="number" id="age" placeholder="22" 
              className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]" 
              defaultValue={age}
              {...register("age")}/>
            {errors.age && (
              <p className="text-sm text-red-500 mt-2"> {errors.age?.message}</p> 
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="bio" className="block mb-2">Bio</label>
            <textarea
              id="bio"
              placeholder="Feel free to enter stuff about yourself, previous work experience and why you joined!"
              className="w-full px-3 py-2 border-2 rounded-md border-[#1f2421]"
              rows={8}
              defaultValue={bio}
              {...register("bio")} 
              onChange={handleDescriptionChange} />
            <p className="text-sm text-gray-500 mt-2">{descriptionLength} / 1000 characters</p>
            {errors.bio && (
              <p className="text-sm text-red-500 mt-2"> {errors.bio?.message}</p> 
            )}
          </div>
        </div>

        {/* Update Profile Button */}
        <button type="submit" 
          className="w-full md:w-auto mt-4 px-8 bg-[#49A078] py-2 rounded-md cursor-pointer font-bold text-center text-white md:mr-4 hover:bg-[#3e7d5a] transition duration-300">
          {loading ? 'Update' : 'Updating...'}
        </button>

        <button 
          className="w-full md:w-auto mt-4 px-8 bg-red-600 py-2 rounded-md cursor-pointer font-bold text-center text-white"
          onClick={goToAccount}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditAccountForm;