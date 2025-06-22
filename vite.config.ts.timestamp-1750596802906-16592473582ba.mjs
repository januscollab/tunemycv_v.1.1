// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { copyFileSync } from "fs";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Copy PDF.js worker to public directory during build and dev
    {
      name: "copy-pdf-worker",
      buildStart() {
        try {
          copyFileSync(
            path.join(__vite_injected_original_dirname, "node_modules/pdfjs-dist/build/pdf.worker.min.js"),
            path.join(__vite_injected_original_dirname, "public/pdf.worker.min.js")
          );
          console.log("PDF.js worker copied to public directory");
        } catch (error) {
          console.warn("Failed to copy PDF.js worker:", error);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IGNvcHlGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUsIGNvbW1hbmQgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBDb3B5IFBERi5qcyB3b3JrZXIgdG8gcHVibGljIGRpcmVjdG9yeSBkdXJpbmcgYnVpbGQgYW5kIGRldlxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXBkZi13b3JrZXInLFxuICAgICAgYnVpbGRTdGFydCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb3B5RmlsZVN5bmMoXG4gICAgICAgICAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL3BkZmpzLWRpc3QvYnVpbGQvcGRmLndvcmtlci5taW4uanMnKSxcbiAgICAgICAgICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICdwdWJsaWMvcGRmLndvcmtlci5taW4uanMnKVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1BERi5qcyB3b3JrZXIgY29waWVkIHRvIHB1YmxpYyBkaXJlY3RvcnknKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBjb3B5IFBERi5qcyB3b3JrZXI6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsb0JBQW9CO0FBSjdCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsTUFBTSxRQUFRLE9BQU87QUFBQSxFQUNsRCxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQTtBQUFBLElBRWhCO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQ1gsWUFBSTtBQUNGO0FBQUEsWUFDRSxLQUFLLEtBQUssa0NBQVcsaURBQWlEO0FBQUEsWUFDdEUsS0FBSyxLQUFLLGtDQUFXLDBCQUEwQjtBQUFBLFVBQ2pEO0FBQ0Esa0JBQVEsSUFBSSwwQ0FBMEM7QUFBQSxRQUN4RCxTQUFTLE9BQU87QUFDZCxrQkFBUSxLQUFLLGlDQUFpQyxLQUFLO0FBQUEsUUFDckQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
