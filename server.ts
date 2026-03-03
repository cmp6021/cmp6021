import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("nexus.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    port INTEGER NOT NULL,
    password TEXT,
    method TEXT,
    plugin TEXT,
    plugin_opts TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    token TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    expires_at DATETIME
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---

  // Get all nodes
  app.get("/api/nodes", (req, res) => {
    const nodes = db.prepare("SELECT * FROM nodes ORDER BY created_at DESC").all();
    res.json(nodes);
  });

  // Add a node
  app.post("/api/nodes", (req, res) => {
    const { name, type, address, port, password, method } = req.body;
    const info = db.prepare(
      "INSERT INTO nodes (name, type, address, port, password, method) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, type, address, port, password, method);
    res.json({ id: info.lastInsertRowid });
  });

  // Delete a node
  app.delete("/api/nodes/:id", (req, res) => {
    db.prepare("DELETE FROM nodes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Subscription Endpoint (The "Encrypted" part for Windows clients)
  // Format: ss://base64(method:password@host:port)#remarks
  app.get("/sub/:token", (req, res) => {
    const nodes = db.prepare("SELECT * FROM nodes").all();
    
    const subContent = nodes.map(node => {
      if (node.type === 'ss') {
        const userInfo = btoa(`${node.method}:${node.password}`);
        return `ss://${userInfo}@${node.address}:${node.port}#${encodeURIComponent(node.name)}`;
      }
      return '';
    }).filter(Boolean).join('\n');

    // Encrypt/Obfuscate the entire list with Base64 (Standard for proxy subs)
    const encodedSub = btoa(subContent);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(encodedSub);
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Server running on http://localhost:${PORT}`);
  });
}

startServer();
