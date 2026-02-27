import { Sidebar } from "lucide-react";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";


function App() {
  return (
    <div className="App">
      <Login />
      <Dashboard/>
      <Sidebar/>
    </div>
  );
}

export default App;