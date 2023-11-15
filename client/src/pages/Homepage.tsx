import { About, FAQ, Footer, Navbar, Welcome } from "../components/Homepage"

const Homepage = () => {
  return (
    <div>
      <Navbar/>
      <Welcome/>
      <About/>
      <FAQ/>
      <Footer/>
    </div>
  )
}

export default Homepage;