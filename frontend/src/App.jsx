import "./App.css";
import {Outlet} from "react-router";

function App() {

    return (
        <div className="h-screen w-screen p-0 m-0">
            <Outlet/>
        </div>
    )
}

export default App;