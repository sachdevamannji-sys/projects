import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite"; // no serveStatic
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../dist/public")));
const PORT = process.env.PORT || 10000;

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    log(`❌ Error: ${message}`);
  });

  if (app.get("env") === "development") {
    // Dev mode: Vite hot reload
    await setupVite(app, server);
  } else {
    // Production: check if client build exists
    const clientPath = path.resolve(__dirname, "../../public");

    if (fs.existsSync(clientPath)) {
      app.use(express.static(clientPath));

      // SPA fallback
      app.get("*", (_, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
      });

      log(`✅ Client build found. Serving static files from ${clientPath}`);
    } else {
      log(`⚠️ Client build not found at ${clientPath}. Server will run APIs only.`);
    }
  }
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public", "index.html"));
});
  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
})();
