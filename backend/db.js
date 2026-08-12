const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Felixporto",
    database: "tamo_aqui"
});

db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar:", err);
        return;
    }

    console.log("MySQL conectado");
});

module.exports = db;