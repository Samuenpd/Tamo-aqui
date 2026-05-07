const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const SECRET = "segredo";


// ==========================
// CADASTRO
// ==========================
app.post("/register", async (req, res) => {

    const { email, senha, tipo } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Campos obrigatórios"
        });
    }

    const hash = await bcrypt.hash(senha, 10);

    db.query(
        "INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)",
        [email, hash, tipo],
        (err) => {

            if (err) {
                return res.status(500).json({
                    erro: "Usuário já existe"
                });
            }

            res.json({
                mensagem: "Usuário criado"
            });
        }
    );
});


// ==========================
// LOGIN
// ==========================
app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        async (err, result) => {

            if (result.length === 0) {
                return res.status(401).json({
                    erro: "Usuário não encontrado"
                });
            }

            const usuario = result[0];

            const ok = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!ok) {
                return res.status(401).json({
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


// ==========================
// PEGAR POSTS
// ==========================
app.get("/posts", (req, res) => {

    db.query(
        "SELECT * FROM posts ORDER BY id DESC",
        (err, result) => {

            res.json(result);
        }
    );
});


// ==========================
// CRIAR POST
// ==========================
app.post("/posts", (req, res) => {

    const {
        texto,
        categoria,
        urgencia,
        localizacao,
        imagem
    } = req.body;

    db.query(
        `INSERT INTO posts
        (texto, categoria, urgencia, localizacao, imagem)
        VALUES (?, ?, ?, ?, ?)`,
        [
            texto,
            categoria,
            urgencia,
            localizacao,
            imagem
        ],
        () => {

            res.json({
                mensagem: "Post criado"
            });
        }
    );
});


// ==========================
// CURTIR
// ==========================
app.put("/posts/:id/like", (req, res) => {

    db.query(
        "UPDATE posts SET likes = likes + 1 WHERE id = ?",
        [req.params.id],
        () => {

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

    db.query(
        "UPDATE posts SET resposta = ? WHERE id = ?",
        [resposta, req.params.id],
        () => {

            res.json({
                mensagem: "Resposta enviada"
            });
        }
    );
});


// ==========================
// EXCLUIR
// ==========================
app.delete("/posts/:id", (req, res) => {

    db.query(
        "DELETE FROM posts WHERE id = ?",
        [req.params.id],
        () => {

            res.json({
                mensagem: "Post deletado"
            });
        }
    );
});


app.listen(3000, () => {
    console.log("Servidor rodando");
});