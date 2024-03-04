import "./App.css";

import { useState } from "react";

import { useMicVAD, utils } from "@ricky0123/vad-react";
// import Modal from "./components/Modal";

import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

function App() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState("");

    const [modalTask, setModalTask] = useState(-1);
    const [showModal, setShowModal] = useState(false);

    const handleAudio = (audio: Float32Array) => {
        const wavBuffer = utils.encodeWAV(audio);

        fetch("http://localhost:5000/api/audio", {
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

        // If the task is an array, we want to add all the tasks in the array
        if (Array.isArray(taskToAdd)) {
            setTasks([...tasks, ...taskToAdd]);
        } else if (taskToAdd.trim() !== "") {
            setTasks([...tasks, taskToAdd]);
            setNewTask("");
        }
    };

    const removeTask = (index: number) => {
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
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

    return (
        <div className="container max-w-xl mx-auto mt-8">
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
                            // alignItems: "center"
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

            <ul className="">
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-between py-4 border-b"
                    >
                        <span>{task}</span>

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
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
