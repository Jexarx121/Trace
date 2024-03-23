const DashboardPostTypeItem = ({ title, icon, number, onColor, onClickFunction } ) => {
  return (
    <div className={`flex-grow rounded-md p-4 ${onColor} transition duration-200 cursor-pointer shadow-xl hover:shadow-slate-500 xl:basis-1/5 basis-1/3`}
      onClick={onClickFunction}>
      <div className="">
        <div className="flex flex-row">
          <div>
            <h1 className="uppercase text-sm tracking-wider">{title}</h1>
            <h1 className="mt-6 text-3xl font-extrabold tracking-wider">{number}</h1>
            <h1 className="text-sm tracking-wider text-[#1f2421] font-bold uppercase mt-2">Posts</h1>
          </div>
            
          <div className="ml-auto">
            <i className={`${icon} p-2 rounded-full text-lg border-[#1f2421]
             border-2 text-[#1f2421]`} />
          </div>
        </div>
      </div>
    </div>
  );
}


export default DashboardPostTypeItem;