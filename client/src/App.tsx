import { Navbar, Welcome, About, Footer, BlockchainInfo } from "./components";

const App = () => {
  return (
    <div>
      <div >
        <Navbar/>
        <Welcome/>
      </div>
      <About/>
      <BlockchainInfo/>
      <Footer/>
    </div>
  )
}

export default App;
