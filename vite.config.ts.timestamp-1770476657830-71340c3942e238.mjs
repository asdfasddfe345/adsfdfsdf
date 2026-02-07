var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/api/ai-enrich.ts
var ai_enrich_exports = {};
__export(ai_enrich_exports, {
  handleAiEnrich: () => handleAiEnrich
});
async function handleAiEnrich(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!AGENTROUTER_API_KEY) {
    console.error("VITE_AGENTROUTER_API_KEY not configured");
    res.status(500).json({ error: "Server configuration error - API key missing" });
    return;
  }
  try {
    const body = req.body;
    const { model = "gpt-4o", messages, temperature = 0.7, max_tokens = 2e3 } = body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid request: messages array required" });
      return;
    }
    console.log(`[DEV] AI Request: model=${model}, messages=${messages.length}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3e4);
    try {
      const response = await fetch(AGENTROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AGENTROUTER_API_KEY}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await response.json();
      if (!response.ok) {
        console.error("[DEV] AgentRouter error:", response.status, data);
        res.status(response.status).json({
          error: data.error?.message || "AgentRouter API error",
          code: data.error?.code || response.status,
          details: data
        });
        return;
      }
      console.log(`[DEV] AI Response: tokens=${data.usage?.total_tokens || 0}`);
      res.status(200).json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === "AbortError") {
        console.error("[DEV] Request timeout");
        res.status(504).json({ error: "Request timeout after 30 seconds" });
        return;
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[DEV] API error:", error);
    res.status(502).json({
      error: "Failed to process AI request",
      detail: error.message
    });
  }
}
var AGENTROUTER_API_KEY, AGENTROUTER_API_URL;
var init_ai_enrich = __esm({
  "src/api/ai-enrich.ts"() {
    AGENTROUTER_API_KEY = import.meta.env.VITE_AGENTROUTER_API_KEY || "";
    AGENTROUTER_API_URL = "https://api.agentrouter.ai/v1/chat/completions";
  }
});

// src/api/ai-health.ts
var ai_health_exports = {};
__export(ai_health_exports, {
  handleAiHealth: () => handleAiHealth
});
function handleAiHealth(req, res) {
  const apiKey = import.meta.env.VITE_AGENTROUTER_API_KEY;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    status: "ok",
    environment: "development",
    agentRouterConfigured: !!apiKey,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
var init_ai_health = __esm({
  "src/api/ai-health.ts"() {
  }
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
function apiMiddleware() {
  return {
    name: "api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) {
          return next();
        }
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = {};
            }
            await handleApiRequest(req, res);
          });
        } else {
          await handleApiRequest(req, res);
        }
      });
    }
  };
}
async function handleApiRequest(req, res) {
  const url = req.url;
  if (url === "/api/ai-enrich" || url.startsWith("/api/ai-enrich?")) {
    const { handleAiEnrich: handleAiEnrich2 } = await Promise.resolve().then(() => (init_ai_enrich(), ai_enrich_exports));
    return handleAiEnrich2(req, res);
  }
  if (url === "/api/ai-health" || url.startsWith("/api/ai-health?")) {
    const { handleAiHealth: handleAiHealth2 } = await Promise.resolve().then(() => (init_ai_health(), ai_health_exports));
    return handleAiHealth2(req, res);
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not Found" }));
}
var vite_config_default = defineConfig({
  plugins: [
    react(),
    apiMiddleware()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-pdf": ["jspdf", "pdfjs-dist"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2FwaS9haS1lbnJpY2gudHMiLCAic3JjL2FwaS9haS1oZWFsdGgudHMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9hcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL2FwaS9haS1lbnJpY2gudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvYXBpL2FpLWVucmljaC50c1wiO2ltcG9ydCB0eXBlIHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcblxuY29uc3QgQUdFTlRST1VURVJfQVBJX0tFWSA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0FHRU5UUk9VVEVSX0FQSV9LRVkgfHwgJyc7XG5jb25zdCBBR0VOVFJPVVRFUl9BUElfVVJMID0gJ2h0dHBzOi8vYXBpLmFnZW50cm91dGVyLmFpL3YxL2NoYXQvY29tcGxldGlvbnMnO1xuXG5pbnRlcmZhY2UgQUlSZXF1ZXN0IHtcbiAgbW9kZWw/OiBzdHJpbmc7XG4gIG1lc3NhZ2VzOiBBcnJheTx7IHJvbGU6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH0+O1xuICB0ZW1wZXJhdHVyZT86IG51bWJlcjtcbiAgbWF4X3Rva2Vucz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFpRW5yaWNoKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuICAvLyBDT1JTIGhlYWRlcnNcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdQT1NULCBPUFRJT05TJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ29udGVudC1UeXBlJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgLy8gSGFuZGxlIHByZWZsaWdodFxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmVzLnN0YXR1cygyMDQpLmVuZCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIE9ubHkgYWxsb3cgUE9TVFxuICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmVzLnN0YXR1cyg0MDUpLmpzb24oeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ2hlY2sgQVBJIGtleVxuICBpZiAoIUFHRU5UUk9VVEVSX0FQSV9LRVkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdWSVRFX0FHRU5UUk9VVEVSX0FQSV9LRVkgbm90IGNvbmZpZ3VyZWQnKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnU2VydmVyIGNvbmZpZ3VyYXRpb24gZXJyb3IgLSBBUEkga2V5IG1pc3NpbmcnIH0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgYm9keTogQUlSZXF1ZXN0ID0gcmVxLmJvZHk7XG4gICAgY29uc3QgeyBtb2RlbCA9ICdncHQtNG8nLCBtZXNzYWdlcywgdGVtcGVyYXR1cmUgPSAwLjcsIG1heF90b2tlbnMgPSAyMDAwIH0gPSBib2R5O1xuXG4gICAgaWYgKCFtZXNzYWdlcyB8fCAhQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdJbnZhbGlkIHJlcXVlc3Q6IG1lc3NhZ2VzIGFycmF5IHJlcXVpcmVkJyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgW0RFVl0gQUkgUmVxdWVzdDogbW9kZWw9JHttb2RlbH0sIG1lc3NhZ2VzPSR7bWVzc2FnZXMubGVuZ3RofWApO1xuXG4gICAgLy8gQ3JlYXRlIHRpbWVvdXQgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCAzMDAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChBR0VOVFJPVVRFUl9BUElfVVJMLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtBR0VOVFJPVVRFUl9BUElfS0VZfWAsXG4gICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgIG1lc3NhZ2VzLFxuICAgICAgICAgIHRlbXBlcmF0dXJlLFxuICAgICAgICAgIG1heF90b2tlbnMsXG4gICAgICAgIH0pLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbREVWXSBBZ2VudFJvdXRlciBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGRhdGEpO1xuICAgICAgICByZXMuc3RhdHVzKHJlc3BvbnNlLnN0YXR1cykuanNvbih7XG4gICAgICAgICAgZXJyb3I6IGRhdGEuZXJyb3I/Lm1lc3NhZ2UgfHwgJ0FnZW50Um91dGVyIEFQSSBlcnJvcicsXG4gICAgICAgICAgY29kZTogZGF0YS5lcnJvcj8uY29kZSB8fCByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgZGV0YWlsczogZGF0YSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYFtERVZdIEFJIFJlc3BvbnNlOiB0b2tlbnM9JHtkYXRhLnVzYWdlPy50b3RhbF90b2tlbnMgfHwgMH1gKTtcblxuICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oZGF0YSk7XG4gICAgfSBjYXRjaCAoZmV0Y2hFcnJvcjogYW55KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBcbiAgICAgIGlmIChmZXRjaEVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbREVWXSBSZXF1ZXN0IHRpbWVvdXQnKTtcbiAgICAgICAgcmVzLnN0YXR1cyg1MDQpLmpzb24oeyBlcnJvcjogJ1JlcXVlc3QgdGltZW91dCBhZnRlciAzMCBzZWNvbmRzJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBmZXRjaEVycm9yO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tERVZdIEFQSSBlcnJvcjonLCBlcnJvcik7XG4gICAgcmVzLnN0YXR1cyg1MDIpLmpzb24oe1xuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gcHJvY2VzcyBBSSByZXF1ZXN0JyxcbiAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICB9KTtcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy9hcGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL2FwaS9haS1oZWFsdGgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zcmMvYXBpL2FpLWhlYWx0aC50c1wiO2ltcG9ydCB0eXBlIHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUFpSGVhbHRoKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xuICBjb25zdCBhcGlLZXkgPSBpbXBvcnQubWV0YS5lbnYuVklURV9BR0VOVFJPVVRFUl9BUElfS0VZO1xuICBcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICByZXMuc3RhdHVzKDIwMCkuanNvbih7XG4gICAgc3RhdHVzOiAnb2snLFxuICAgIGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnLFxuICAgIGFnZW50Um91dGVyQ29uZmlndXJlZDogISFhcGlLZXksXG4gICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gIH0pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gU2ltcGxlIEFQSSBtaWRkbGV3YXJlIGZvciBkZXZlbG9wbWVudFxuZnVuY3Rpb24gYXBpTWlkZGxld2FyZSgpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnYXBpLW1pZGRsZXdhcmUnLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IGFueSkge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICAgICAgLy8gT25seSBoYW5kbGUgL2FwaS8qIHJvdXRlc1xuICAgICAgICBpZiAoIXJlcS51cmwuc3RhcnRzV2l0aCgnL2FwaS8nKSkge1xuICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYXJzZSBib2R5IGZvciBQT1NUIHJlcXVlc3RzXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuazogYW55KSA9PiB7XG4gICAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICByZXEuYm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHJlcS5ib2R5ID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVBcGlSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBoYW5kbGVBcGlSZXF1ZXN0KHJlcSwgcmVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBcGlSZXF1ZXN0KHJlcTogYW55LCByZXM6IGFueSkge1xuICBjb25zdCB1cmwgPSByZXEudXJsO1xuXG4gIC8vIFJvdXRlIHRvIGFwcHJvcHJpYXRlIGhhbmRsZXJcbiAgaWYgKHVybCA9PT0gJy9hcGkvYWktZW5yaWNoJyB8fCB1cmwuc3RhcnRzV2l0aCgnL2FwaS9haS1lbnJpY2g/JykpIHtcbiAgICBjb25zdCB7IGhhbmRsZUFpRW5yaWNoIH0gPSBhd2FpdCBpbXBvcnQoJy4vc3JjL2FwaS9haS1lbnJpY2gnKTtcbiAgICByZXR1cm4gaGFuZGxlQWlFbnJpY2gocmVxLCByZXMpO1xuICB9XG5cbiAgaWYgKHVybCA9PT0gJy9hcGkvYWktaGVhbHRoJyB8fCB1cmwuc3RhcnRzV2l0aCgnL2FwaS9haS1oZWFsdGg/JykpIHtcbiAgICBjb25zdCB7IGhhbmRsZUFpSGVhbHRoIH0gPSBhd2FpdCBpbXBvcnQoJy4vc3JjL2FwaS9haS1oZWFsdGgnKTtcbiAgICByZXR1cm4gaGFuZGxlQWlIZWFsdGgocmVxLCByZXMpO1xuICB9XG5cbiAgLy8gNDA0IGZvciB1bmtub3duIHJvdXRlc1xuICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcbiAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTm90IEZvdW5kJyB9KSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGFwaU1pZGRsZXdhcmUoKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAndmVuZG9yLW1vdGlvbic6IFsnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgICAgICd2ZW5kb3Itc3VwYWJhc2UnOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICAgICd2ZW5kb3ItcGRmJzogWydqc3BkZicsICdwZGZqcy1kaXN0J10sXG4gICAgICAgICAgJ3ZlbmRvci1mb3Jtcyc6IFsncmVhY3QtaG9vay1mb3JtJywgJ0Bob29rZm9ybS9yZXNvbHZlcnMnLCAnem9kJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFZQSxlQUFzQixlQUFlLEtBQWMsS0FBZTtBQUVoRSxNQUFJLFVBQVUsK0JBQStCLEdBQUc7QUFDaEQsTUFBSSxVQUFVLGdDQUFnQyxlQUFlO0FBQzdELE1BQUksVUFBVSxnQ0FBZ0MsY0FBYztBQUM1RCxNQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUdoRCxNQUFJLElBQUksV0FBVyxXQUFXO0FBQzVCLFFBQUksT0FBTyxHQUFHLEVBQUUsSUFBSTtBQUNwQjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLElBQUksV0FBVyxRQUFRO0FBQ3pCLFFBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8scUJBQXFCLENBQUM7QUFDcEQ7QUFBQSxFQUNGO0FBR0EsTUFBSSxDQUFDLHFCQUFxQjtBQUN4QixZQUFRLE1BQU0seUNBQXlDO0FBQ3ZELFFBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8s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O0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGlCQUFpQixDQUFDLGVBQWU7QUFBQSxVQUNqQyxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQSxVQUMzQyxjQUFjLENBQUMsU0FBUyxZQUFZO0FBQUEsVUFDcEMsZ0JBQWdCLENBQUMsbUJBQW1CLHVCQUF1QixLQUFLO0FBQUEsUUFDbEU7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJoYW5kbGVBaUVucmljaCIsICJoYW5kbGVBaUhlYWx0aCJdCn0K
