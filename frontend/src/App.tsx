import "./App.css";

import useAuthListener from "./hooks/useAuthListener";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

function App() {
    const { user } = useAuthListener();

    return <div>{user ? <Home /> : <Auth />}</div>;
}

export default App;
