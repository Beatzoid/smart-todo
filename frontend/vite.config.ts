import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
                    dest: "./"
                },
                {
                    src: "node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
                    dest: "./"
                },
                {
                    src: "node_modules/onnxruntime-web/dist/*.wasm",
                    dest: "./"
                }
            ]
        })
    ]
});
