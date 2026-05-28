const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {

    if (err) {
        console.log(err.message);
    } else {
        console.log("SQLite conectado");
    }
});


db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    senha TEXT,
    tipo TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT,
    categoria TEXT,
    urgencia TEXT,
    localizacao TEXT,
    imagem TEXT,
    likes INTEGER DEFAULT 0,
    resposta TEXT
)
`);

module.exports = db;