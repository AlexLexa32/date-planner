const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

// CORS, чтобы фронтенд мог стучаться
app.use(cors());
app.use(express.json());

// Подключение к SQLite (файл базы)
const db = new sqlite3.Database("./dates.db");

// Создаём таблицу, если её нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS date_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      duration INTEGER NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Получить все идеи
app.get("/api/ideas", (req, res) => {
  db.all("SELECT * FROM date_ideas ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Создать новую идею
app.post("/api/ideas", (req, res) => {
  const { title, duration, category } = req.body;

  if (!title || !duration || !category) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const stmt = db.prepare("INSERT INTO date_ideas (title, duration, category) VALUES (?, ?, ?)");
  stmt.run(title, duration, category, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, duration, category });
  });
  stmt.finalize();
});

// Удалить идею
app.delete("/api/ideas/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM date_ideas WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Идея не найдена" });
    res.json({ message: "Идея удалена" });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
