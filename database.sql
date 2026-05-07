CREATE DATABASE tamoaqui;

USE tamoaqui;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    tipo VARCHAR(50)
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT,
    categoria VARCHAR(100),
    urgencia VARCHAR(50),
    localizacao VARCHAR(255),
    imagem LONGTEXT,
    likes INT DEFAULT 0,
    resposta TEXT
);