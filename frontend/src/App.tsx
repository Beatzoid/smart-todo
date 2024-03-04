import "./App.css";

import { useState } from "react";

import { useMicVAD, utils } from "@ricky0123/vad-react";

function App() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState<string>("");

    const [recording, setRecording] = useState(false);

    const [transcription, setTranscription] = useState<string>("");

    const vad = useMicVAD({
        // Prevents it from starting to listen when the page loads
        startOnLoad: false,
        onSpeechEnd: (audio) => {
            const wavBuffer = utils.encodeWAV(audio);

            fetch("http://localhost:5000/api/audio", {
                method: "POST",
                body: wavBuffer
            })
                .then((res: any) => res.text())
                .then((data: any) => {
                    setTranscription(transcription + data);
                });
        }
    });

    const addTask = () => {
        if (newTask.trim() !== "") {
            setTasks([...tasks, newTask]);
            setNewTask("");
        }
    };

    const removeTask = (index: number) => {
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
    };

    const handleLiveAudio = async () => {
        setRecording(!recording);

        if (recording) {
            vad.pause();
        } else {
            vad.start();
        }
    };

    return (
        <div className="container mx-auto mt-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
            <div className="flex mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="w-full border-2 rounded-l py-2 px-4"
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
                    onClick={addTask}
                    className="bg-blue-500 text-white ms-4 py-2 px-6 rounded"
                >
                    Add
                </button>
            </div>

            {transcription}

            <ul>
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-center border-b py-2"
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
