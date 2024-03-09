import { Homepage, Login, Account, EditAccount, Dashboard } from "./pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LINKS } from "./components/constants";
import { EthContext } from "./eth/context";
import { createProvider } from "./eth/provider";
import { createInstance } from "./eth/forwarder";

const App = () => {
  const provider = createProvider();
  const nodeManager = createInstance(provider);
  const ethContext = { nodeManager, provider };

  return (
    <Router>
      <Routes>
        <Route path={LINKS.ACCOUNT} element={<Account/>}/>
        <Route path={LINKS.EDIT_ACCOUNT} element={<EditAccount/>}/>
        <Route path={LINKS.LOGIN} element={<Login/>}/>
        <Route path={LINKS.HOMEPAGE} element={<Homepage/>}/>
        <Route path={LINKS.DASHBOARD} element={
          <EthContext.Provider value={ethContext}>
            <Dashboard/>
          </EthContext.Provider>
        }/>
      </Routes>
    </Router>
  );
};

export default App;
