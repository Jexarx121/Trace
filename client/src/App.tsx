import { Homepage, Login, Account } from "./pages";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LINKS } from "./components/constants";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path={LINKS.ACCOUNT} element={<Account/>}/>
        <Route path={LINKS.LOGIN} element={<Login/>}/>
        <Route path={LINKS.HOMEPAGE} element={<Homepage/>}/>
      </Routes>
    </Router>
  )
}

export default App;
