import "./App.css";

import { useState } from "react";

import { useMicVAD, utils } from "@ricky0123/vad-react";

function App() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>("");

    const [recording, setRecording] = useState(false);

    const addTask = (task?: string | string[]) => {
        const taskToAdd = task ? task : newTask;

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

    const handleAudio = (audio: Float32Array) => {
        const wavBuffer = utils.encodeWAV(audio);

        fetch("http://localhost:5000/api/audio", {
            method: "POST",
            body: wavBuffer
        })
            .then((res: any) => res.text())
            .then((data: any) => {
                const parsedData = JSON.parse(data);
                console.log(parsedData);

                addTask(
                    parsedData
                        .filter((item: any) => item.action === "create")
                        .map((item: any) => item.name)
                );

                const toRemove = parsedData.filter(
                    (item: any) => item.action === "delete"
                );

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

    const handleLiveAudio = async () => {
        setRecording(!recording);

        if (recording) {
            vad.pause();
        } else {
            vad.start();
        }
    };

    return (
        <div className="container max-w-md mx-auto mt-8">
            <h1 className="mb-4 text-2xl font-bold">To-Do List</h1>
            <div className="flex mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="w-full px-4 py-2 border-2 rounded-l"
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
                            onClick={() => handleLiveAudio()}
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
                        className="flex items-center justify-between py-2 border-b"
                    >
                        <span>{task}</span>
                        <button
                            onClick={() => removeTask(index)}
                            className="text-red-500"
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
