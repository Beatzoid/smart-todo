import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
    const [count, setCount] = useState(0);
    const [serverData, setServerData] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api").then((res) => {
            res.text().then((data) => {
                setServerData(data);
            });
        });
    }, []);

    return (
        <>
            <h1 className="text-3xl font-bold">{serverData}</h1>
        </>
    );
}

export default App;
