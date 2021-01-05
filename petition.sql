-- createdb petition
-- psql -d petition -f petition.sql

-- order of DROP statements is important,
-- because of references between tables
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature VARCHAR NOT NULL CHECK(signature<>''),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(255),
    homepage VARCHAR(255),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)
)