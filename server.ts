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
    type TEXT NOT NULL, -- ss, vmess, vless, trojan
    address TEXT NOT NULL,
    port INTEGER NOT NULL,
    password TEXT,
    method TEXT,
    uuid TEXT,
    sni TEXT,
    alpn TEXT,
    path TEXT,
    host TEXT,
    flow TEXT,
    security TEXT, -- tls, reality
    public_key TEXT,
    short_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('sub_token', 'default-token');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('routing_mode', 'rule');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('update_interval', '24');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('dns_server', '1.1.1.1');
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---

  app.get("/api/nodes", (req, res) => {
    const nodes = db.prepare("SELECT * FROM nodes ORDER BY created_at DESC").all();
    res.json(nodes);
  });

  app.post("/api/nodes", (req, res) => {
    const { 
      name, type, address, port, password, method, 
      uuid, sni, alpn, path, host, flow, security, public_key, short_id 
    } = req.body;
    
    const info = db.prepare(`
      INSERT INTO nodes (
        name, type, address, port, password, method, 
        uuid, sni, alpn, path, host, flow, security, public_key, short_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, type, address, port, password, method, 
      uuid, sni, alpn, path, host, flow, security, public_key, short_id
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/nodes/:id", (req, res) => {
    db.prepare("DELETE FROM nodes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Settings Endpoints
  app.get("/api/settings", (req, res) => {
    const settingsRows = db.prepare("SELECT * FROM settings").all();
    const settings = settingsRows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const updates = req.body;
    const stmt = db.prepare("UPDATE settings SET value = ? WHERE key = ?");
    
    const transaction = db.transaction((updates) => {
      for (const [key, value] of Object.entries(updates)) {
        stmt.run(String(value), key);
      }
    });
    
    transaction(updates);
    res.json({ success: true });
  });

  // Universal Subscription Endpoint
  app.get("/sub/:token", (req, res) => {
    // Verify token
    const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'sub_token'").get() as any;
    if (tokenSetting && tokenSetting.value !== req.params.token) {
      return res.status(403).send("Forbidden");
    }

    const nodes = db.prepare("SELECT * FROM nodes").all();
    
    const subContent = nodes.map(node => {
      const remarks = encodeURIComponent(node.name);
      
      if (node.type === 'ss') {
        const userInfo = btoa(`${node.method}:${node.password}`);
        return `ss://${userInfo}@${node.address}:${node.port}#${remarks}`;
      }
      
      if (node.type === 'vmess') {
        const vmessObj = {
          v: "2",
          ps: node.name,
          add: node.address,
          port: node.port,
          id: node.uuid,
          aid: "0",
          scy: "auto",
          net: "tcp",
          type: "none",
          host: node.host || "",
          path: node.path || "",
          tls: node.security === 'tls' ? "tls" : ""
        };
        return `vmess://${btoa(JSON.stringify(vmessObj))}`;
      }

      if (node.type === 'vless') {
        let url = `vless://${node.uuid}@${node.address}:${node.port}?type=tcp&security=${node.security || 'none'}`;
        if (node.sni) url += `&sni=${node.sni}`;
        if (node.flow) url += `&flow=${node.flow}`;
        if (node.security === 'reality') {
          url += `&pbk=${node.public_key}&sid=${node.short_id}`;
        }
        url += `#${remarks}`;
        return url;
      }

      if (node.type === 'trojan') {
        let url = `trojan://${node.password}@${node.address}:${node.port}?security=${node.security || 'tls'}`;
        if (node.sni) url += `&sni=${node.sni}`;
        url += `#${remarks}`;
        return url;
      }

      return '';
    }).filter(Boolean).join('\n');

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
