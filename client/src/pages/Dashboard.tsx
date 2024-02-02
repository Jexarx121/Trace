import { Footer, Navbar } from "../components/Homepage";
import { DashboardInfo } from "../components/Dashboard";

const Dashboard = () => {
  return (
    <div>
      <Navbar/>
      <DashboardInfo/>
      <Footer/>
    </div>
  )
}

export default Dashboard;