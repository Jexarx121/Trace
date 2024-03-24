import { About, FAQ, Footer, Icons, Navbar, Welcome } from "./index";

const HomepageComponent = () => {
  return (
    <div>
      <Navbar/>
      <Welcome/>
      <Icons/>
      <About/>
      <FAQ/>
      <Footer/>
    </div>
  );
};

export default HomepageComponent;