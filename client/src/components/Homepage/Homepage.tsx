import { UserIdContext } from "../Context/UserIdContext";
import { About, FAQ, Footer, Navbar, Welcome } from "./index";
import { useContext } from "react";

const HomepageComponent = () => {
  const { userId } = useContext(UserIdContext);

  return (
    <div>
      <Navbar/>
      <Welcome/>
      <About/>
      <FAQ/>
      <Footer/>
    </div>
  );
};

export default HomepageComponent;