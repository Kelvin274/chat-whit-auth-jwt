DROP DATABASE IF EXISTS chatdb;
CREATE DATABASE chatdb;

USE chatdb;

CREATE TABLE users (
	id BINARY(16) PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    username VARCHAR(60)
);
    
SELECT * FROM messages;

SELECT id, username, email, create_at
FROM users;
-- WHERE username = "keynux";