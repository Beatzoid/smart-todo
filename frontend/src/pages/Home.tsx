import { useEffect, useState } from "react";

import { useMicVAD, utils } from "@ricky0123/vad-react";

import ReactModal from "react-modal";

import { SERVER_URL } from "../utils/constants";

import {
    orderBy,
    where,
    getDocs,
    collection,
    query,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc
} from "firebase/firestore";
import { db } from "../services/firebase";
import { getAuth, signOut } from "firebase/auth";

ReactModal.setAppElement("#root");

function Home() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState("");

    const [modalTask, setModalTask] = useState(-1);
    const [showModal, setShowModal] = useState(false);

    const handleAudio = (audio: Float32Array) => {
        const wavBuffer = utils.encodeWAV(audio);

        fetch(`${SERVER_URL}/api/audio`, {
            method: "POST",
            body: wavBuffer
        })
            .then((res: any) => res.text())
            .then((data: any) => {
                const parsedData = JSON.parse(data);

                // Filters only instructions to be created
                // and then passes only their names into the addTask function
                addTask(
                    parsedData
                        .filter((item: any) => item.action === "create")
                        .map((item: any) => item.name)
                );

                // Filters only instructions to be deleted
                const toRemove = parsedData.filter(
                    (item: any) => item.action === "delete"
                );

                // Removes the tasks from the list
                toRemove.forEach((item: any) => {
                    const index = tasks.indexOf(item.name);

                    if (index !== -1) removeTask(index);
                });
            });
    };

    const vad = useMicVAD({
        // Prevents it from starting to listen when the page loads
        startOnLoad: false,
        onSpeechEnd: handleAudio
    });

    const addTask = (task?: string | string[]) => {
        const taskToAdd = task ? task : newTask;
        const collectionRef = collection(db, "todo");
        const userId = JSON.parse(localStorage.getItem("authUser")!).uid;

        // If the task is an array, we want to add all the tasks in the array
        if (Array.isArray(taskToAdd)) {
            setTasks([...tasks, ...taskToAdd]);

            // Update the firestore database with the new tasks array
            taskToAdd.forEach((task) => {
                addDoc(collectionRef, {
                    name: task,
                    timestamp: serverTimestamp(),
                    userId: userId
                });
            });
        } else if (taskToAdd.trim() !== "") {
            setTasks([...tasks, taskToAdd]);
            setNewTask("");

            // Update the firestore database with the new task
            addDoc(collectionRef, {
                name: taskToAdd,
                timestamp: serverTimestamp(),
                userId: userId
            });
        }
    };

    const removeTask = (index: number) => {
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);

        // Update the firestore database with the updated tasks array

        const collectionRef = collection(db, "todo");
        const userId = JSON.parse(localStorage.getItem("authUser")!).uid;

        getDocs(
            query(
                collectionRef,
                orderBy("timestamp"),
                where("userId", "==", userId)
            )
        )
            .then((todo) => {
                const docId = todo.docs[index].id;

                deleteDoc(doc(collectionRef, docId));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleMicrophoneClick = async () => {
        if (vad.listening) {
            vad.pause();
        } else {
            vad.start();
        }
    };

    const handleTaskPopup = (index: number) => {
        setModalTask(index);
        setShowModal(true);
    };

    const handleLogout = () => {
        const auth = getAuth();

        signOut(auth)
            .then(() => {
                localStorage.removeItem("authUser");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        const collectionRef = collection(db, "todo");
        const userId = JSON.parse(localStorage.getItem("authUser")!).uid;

        const getTodo = async () => {
            const q = query(
                collectionRef,
                orderBy("timestamp"),
                where("userId", "==", userId)
            );

            await getDocs(q)
                .then((todo) => {
                    setTasks(todo.docs.map((doc) => doc.data().name));
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        getTodo();
    }, []);

    return (
        <>
            <div className="container max-w-xl mx-auto mt-8">
                <button
                    onClick={() => handleLogout()}
                    className="absolute top-0 right-0 px-6 py-2 mt-4 mr-4 text-white bg-red-500 rounded"
                >
                    Logout
                </button>

                {showModal && (
                    <ReactModal
                        style={{
                            overlay: {
                                position: "fixed",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "55%",
                                height: "55%",
                                overflow: "auto",
                                background: "transparent",
                                borderRadius: "10px"
                            },
                            content: {
                                backgroundColor: "#3d3d3d",
                                border: "none",
                                display: "flex",
                                flexDirection: "column"
                            }
                        }}
                        isOpen={showModal}
                    >
                        <button
                            className="absolute w-8 h-8 p-2 bg-red-500 rounded-full top-4 right-4"
                            onClick={() => setShowModal(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h1 className="mb-4 text-2xl font-bold text-center">
                            Edit Task
                        </h1>

                        <label className="text-white">Task Name</label>
                        <input
                            placeholder="Task Name"
                            className="w-full px-4 py-2 mt-4 border-2 rounded"
                            defaultValue={tasks[modalTask]}
                            onChange={(e) => {
                                const updatedTasks = [...tasks];
                                updatedTasks[modalTask] = e.target.value;
                                setTasks(updatedTasks);
                            }}
                        />
                    </ReactModal>
                )}

                <h1 className="mb-4 text-2xl font-bold">To-Do List</h1>
                <div className="flex mb-4">
                    <div className="relative flex-grow w-96">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="w-full px-4 py-2 border-2 rounded"
                        />

                        <div className="absolute inset-y-0 right-0 flex items-center px-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`w-6 h-6 text-white-500 cursor-pointer ${
                                    vad.listening
                                        ? "text-red-500"
                                        : "text-white-500"
                                }`}
                                onClick={() => handleMicrophoneClick()}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                                />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => addTask()}
                        className="px-6 py-2 text-white bg-blue-500 rounded ms-4"
                    >
                        Add
                    </button>
                </div>

                <ul>
                    {tasks.map((task, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between py-4 border-b"
                        >
                            <span>{task}</span>

                            <div className="justify-end">
                                <button
                                    className="text-blue-500 ms-4"
                                    onClick={() => handleTaskPopup(index)}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => removeTask(index)}
                                    className="text-red-500 ms-4"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default Home;
