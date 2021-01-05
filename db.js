const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:reichlej:reichlej@localhost:5432/petition"
);

module.exports.getSigners = function getSigners(city) {
    let query =
        "SELECT * FROM users JOIN signatures ON signatures.user_id = users.id JOIN user_profiles ON user_profiles.user_id = users.id";

    if (city === undefined) {
        return db.query(query);
    } else {
        return db.query(query + " WHERE LOWER(city)=LOWER($1)", [city]);
    }
};

module.exports.addSignature = function addSignature(user_id, signature) {
    return db.query(
        "INSERT INTO signatures (user_id, signature) VALUES ($1,$2) RETURNING *",
        [user_id, signature]
    );
};

module.exports.getSigById = function getSigById(id) {
    return db.query("SELECT * FROM signatures WHERE user_id = $1", [id]);
};

module.exports.login = function login(username) {
    return db.query("SELECT * FROM users WHERE email = $1", [username]);
};

module.exports.addUser = function addUser(
    firstname,
    lastname,
    email,
    password
) {
    return db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [firstname, lastname, email, password]
    );
};

module.exports.addUserData = function addUserData(
    age,
    city,
    homepage,
    user_id
) {
    return db.query(
        "INSERT INTO user_profiles (age,city,homepage,user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [age === "" ? null : age, city, homepage, user_id]
    );
};

module.exports.updateOptionalUserData = function updateOptionalUserData(
    age,
    city,
    homepage,
    user
) {
    return db.query(
        "UPDATE user_profiles SET age=$1,city=$2,homepage=$3 WHERE users.id=$4",
        [age, city, homepage, user]
    );
};

module.exports.getUserData = function getUserData(user, addInfoExist) {
    if (addInfoExist) {
        return db.query(
            "SELECT * FROM users JOIN user_profiles ON user_profiles.user_id = users.id WHERE users.id=$1",
            [user]
        );
    } else {
        return db.query("SELECT * FROM users WHERE users.id=$1", [user]);
    }
};

module.exports.updateUserData = function updateUserData(
    firstname,
    lastname,
    email,
    user
) {
    return db.query(
        "UPDATE users SET firstname=$1,lastname=$2,email=$3 WHERE users.id=$4",
        [firstname, lastname, email, user]
    );
};

module.exports.updatePassword = function updatePassword(password, user) {
    return db.query("UPDATE users SET password=$1 WHERE users.id=$2", [
        password,
        user,
    ]);
};

module.exports.updateOptionalUserData = function updateOptionalUserData(
    age,
    city,
    homepage,
    user
) {
    return db.query(
        "INSERT INTO user_profiles (age,city,homepage,user_id) VALUES ($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET age=$1,city=$2,homepage=$3",
        [age === "" ? null : age, city, homepage, user]
    );
};

module.exports.deleteSig = function deleteSig(username) {
    return db.query("DELETE FROM signatures WHERE user_id=$1", [username]);
};

module.exports.countSigs = function countSigs() {
    return db.query("SELECT COUNT(*) FROM signatures");
};
