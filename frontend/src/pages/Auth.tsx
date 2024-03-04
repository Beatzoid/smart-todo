import { useState } from "react";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        const auth = getAuth();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                console.log(user);
                setError("");
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage);
            });
    };

    const handleRegister = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                console.log(user);
                setError("");
            })
            .catch((error) => {
                const errorMessage = error.message;

                setError(errorMessage);
            });
    };

    return (
        <div className="flex items-center justify-center">
            <form className="flex flex-col items-center justify-center">
                <h1 className="mb-4 text-3xl text-center text-bold">Auth</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="p-2 mb-3 rounded"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    className="p-2 mb-2 rounded"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />

                <p className="text-red-500">{error}</p>

                <div className="flex">
                    <button
                        type="submit"
                        className="mt-2 btn"
                        onClick={(e) => handleLogin(e)}
                    >
                        Login
                    </button>

                    <button
                        type="submit"
                        className="mt-2 ml-4"
                        onClick={(e) => handleRegister(e)}
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Auth;
