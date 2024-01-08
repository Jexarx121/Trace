import { Homepage, Login, Account, EditAccount, Dashboard } from "./pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LINKS } from "./components/constants";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={LINKS.ACCOUNT} element={<Account/>}/>
        <Route path={LINKS.EDIT_ACCOUNT} element={<EditAccount/>}/>
        <Route path={LINKS.LOGIN} element={<Login/>}/>
        <Route path={LINKS.HOMEPAGE} element={<Homepage/>}/>
        <Route path={LINKS.DASHBOARD} element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
};

export default App;
