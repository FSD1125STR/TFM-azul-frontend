import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "")
    const target =
        env.VITE_API_URL ||
        `http://${env.VITE_BACK_HOST || "localhost"}:${env.VITE_BACK_PORT || 3000}`

    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api": {
                    target,
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    }
})
