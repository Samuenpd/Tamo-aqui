const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tamoaqui"
});

db.connect(err => {
    if (err) {
        console.log("Erro no banco");
        return;
    }

    console.log("MySQL conectado");
});

module.exports = db;