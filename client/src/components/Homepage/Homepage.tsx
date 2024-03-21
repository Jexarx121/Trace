import { About, FAQ, Footer, Navbar, Welcome } from "./index";

const HomepageComponent = () => {
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