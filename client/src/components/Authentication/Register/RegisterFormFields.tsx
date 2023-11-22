import RegisterSchema from "./RegisterSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

type RegisterSchemaType = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: ""
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterSchemaType>({ resolver: zodResolver(RegisterSchema), mode: "onBlur"});
  
  const onSubmit = (data: RegisterSchemaType) => {
    setFormData({
      firstName: data.firstName,
      surname: data.surname,
      email: data.email,
      password: data.password
    });
    console.log(formData);
  }; 
  
  return (
    <div className="flex md:flex-row flex-col">
      <form className="flex flex-col p-5 pr-8 border-r border-gray-400" onSubmit={handleSubmit(onSubmit)}>
        <label className='uppercase text-[#49A078] text-md'>First Name</label>
        <input className='mb-1 mt-1 p-3 outline-1 outline-[#263228] outline rounded-sm pr-5 focus:outline-[#49A078] focus:outline-2'
          {...register("firstName")} placeholder="John"/>
        <span className="text-red-500 text-sm mt-0 mb-4">{errors.firstName?.message}</span>

        <label className='uppercase text-[#49A078] text-md'>Surname</label>
        <input className='mb-1 mt-1 p-3 outline-1 outline-[#263228] outline rounded-sm pr-5 focus:outline-[#49A078] focus:outline-2'
          {...register("surname")} placeholder="Doe"/>
        <span className="text-red-500 text-sm mt-0 mb-4">{errors.surname?.message}</span>

        <label className='uppercase text-[#49A078] text-md'>Email Address</label>
        <input className='mb-1 mt-1 p-3 outline-1 outline-[#263228] outline rounded-sm pr-5 focus:outline-[#49A078] focus:outline-2'
          {...register("email")} placeholder="john@example.com"/>
        <span className="text-red-500 text-sm mt-0 mb-4">{errors.email?.message}</span>

        <label className='uppercase text-[#49A078] text-md'>Password</label>
        <div className="relative">
          <input className='mb-1 mt-1 p-3 outline-1 outline-[#263228] outline rounded-sm pr-5 focus:outline-[#49A078] focus:outline-2'
            {...register("password")} placeholder="Password" type={showPassword ? "text": "password"}/>
            <span onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer absolute right-2 top-4 text-[#263228]">
              {/* Font Awesome Eye Icon */}
              {showPassword ? <i className="far fa-eye"></i> : <i className="far fa-eye-slash"></i>}
            </span>
        </div>
        <span className="text-red-500 text-sm mt-0 mb-4">{errors.password?.message}</span>

        <button className="bg-[#263228] text-white p-3 mt-3 hover:text-[#263228] border-2
         hover:bg-white border-[#263228] font-bold authentication-button" type="submit">
          Register
        </button>
      </form>

      {/* OAuth buttons */}
      <div className="flex items-center justify-center p-4">
        {/* Google OAuth */}
        {/* You may need to replace this with the appropriate library */}
        <h1>LOREM IPSUM</h1>

        {/* Apple OAuth */}
        {/* Add Apple OAuth button here */}
      </div>
    </div>
  );
}

export default RegisterForm;

