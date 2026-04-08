import "./App.css";
import {Outlet} from "react-router";


function App() {

    return (
        <div className="h-screen w-screen flex justify-center p-6">
            <Outlet/>
        </div>
    )
}

export default App;