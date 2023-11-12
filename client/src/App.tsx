import { Navbar, Welcome, About, Footer, FAQ } from "./components";

const App = () => {
  return (
    <div>
      <div >
        <Navbar/>
        <Welcome/>
      </div>
      <About/>
      <FAQ/>
      <Footer/>
    </div>
  )
}

export default App;
