type AuthTitleProps = {
  title: string,
  subTitle: string,
};

const AuthTitle = ({title, subTitle}: AuthTitleProps) => (
  <div className="text-[#263228]">
    <h1 className="text-5xl">{title}</h1>
    <h2 className="text-3xl">{subTitle}</h2>
  </div>
);


export default AuthTitle;
