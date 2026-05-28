const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const SECRET = "segredo";

app.post("/register", async (req, res) => {

    const { email, senha, tipo } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    db.run(
        `
        INSERT INTO usuarios (email, senha, tipo)
        VALUES (?, ?, ?)
        `,
        [email, hash, tipo],
        function(err) {

            if (err) {
                return res.json({
                    erro: "Usuário já existe"
                });
            }

            res.json({
                mensagem: "Usuário criado"
            });
        }
    );
});


app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    db.get(
        `
        SELECT * FROM usuarios
        WHERE email = ?
        `,
        [email],
        async (err, usuario) => {

            if (!usuario) {
                return res.json({
                    erro: "Usuário não encontrado"
                });
            }

            const ok = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!ok) {
                return res.json({
                    erro: "Senha incorreta"
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.id
                },
                SECRET
            );

            res.json({
                token,
                tipo: usuario.tipo,
                email: usuario.email
            });
        }
    );
});

app.get("/posts", (req, res) => {

    db.all(
        `
        SELECT * FROM posts
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            res.json(rows);
        }
    );
});


app.post("/posts", (req, res) => {

    const {
        texto,
        categoria,
        urgencia,
        localizacao,
        imagem
    } = req.body;

    db.run(
        `
        INSERT INTO posts
        (
            texto,
            categoria,
            urgencia,
            localizacao,
            imagem
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            texto,
            categoria,
            urgencia,
            localizacao,
            imagem
        ],
        function(err) {

            if (err) {
                return res.json({
                    erro: err.message
                });
            }

            res.json({
                mensagem: "Post criado"
            });
        }
    );
});


app.put("/posts/:id/like", (req, res) => {

    db.run(
        `
        UPDATE posts
        SET likes = likes + 1
        WHERE id = ?
        `,
        [req.params.id],
        function(err) {

            res.json({
                mensagem: "Like adicionado"
            });
        }
    );
});


// ==========================
// RESPONDER
// ==========================
app.put("/posts/:id/resposta", (req, res) => {

    const { resposta } = req.body;

    db.run(
        `
        UPDATE posts
        SET resposta = ?
        WHERE id = ?
        `,
        [resposta, req.params.id],
        function(err) {

            res.json({
                mensagem: "Resposta enviada"
            });
        }
    );
});

app.delete("/posts/:id", (req, res) => {

    db.run(
        `
        DELETE FROM posts
        WHERE id = ?
        `,
        [req.params.id],
        function(err) {

            res.json({
                mensagem: "Post deletado"
            });
        }
    );
});


app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});