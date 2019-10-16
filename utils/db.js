const spicedPg = require("spiced-pg");
// const { dbuser, dbpass } = require("../secrets.json");
//
// const db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/petition`);

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbuser, dbpass } = require("../secrets");
    db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/petition`);
}

// users table
exports.addDetails = function(first, last, email, password) {
    console.log(" user data");
    return db
        .query(
            `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
            [first, last, email, password]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

//petition table
exports.addSignature = function(sig, user_id) {
    return db
        .query(
            // this one is refering to sql
            `INSERT INTO petition (signatures, user_id)
                VALUES ($1, $2)
                RETURNING id`,
            [sig, user_id]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

//user_profiles  table
exports.addUsersprofile = function(age, city, url, user_id) {
    console.log(" user data");
    return db
        .query(
            `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
            [age || null, city || null, url || null, user_id || null]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

//we use this one also for the profile/edit(I already joined the tables)  to find with the WHERE(condition) the current user   better to name itsomething like getProfile. it joins the tables users and user_profiles
exports.getSigners = function() {
    return db
        .query(
            `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
            FROM petition
            LEFT JOIN users
            ON petition.user_id = users.id
            LEFT JOIN user_profiles
            ON users.id = user_profiles.user_id`
        )
        .then(({ rows }) => {
            return rows;
        });
};
// to get the signature
exports.getSignature = function(id) {
    return db.query(
        //to check if it is sig, id or user_id
        `SELECT signatures, user_id FROM petition WHERE user_id=$1`,
        [id]
    );
};
// to get the password
exports.getHashedpassword = function(email) {
    return db
        .query(
            `SELECT password,
            id FROM users
            WHERE email=$1`,
            [email]
        )
        .then(({ rows }) => {
            return rows;
        });
};

// i will use it for city.params
exports.getSignersByCity = function(city) {
    return db
        .query(
            `SELECT users.first, users.last, user_profiles.age, user_profiles.url
            FROM petition
            JOIN users
            ON petition.user_id = users.id
            JOIN user_profiles ON users.id = user_profiles.user_id
            WHERE LOWER(user_profiles.city)=LOWER($1)`,
            [city]
        )
        .then(({ rows }) => {
            return rows;
        });
};
// user_profiles update  Upsert
exports.updateUsersProfile = function(user, age, city, url) {
    console.log("users_profiles update");
    return db
        .query(
            `INSERT INTO user_profiles (user_id, age, city, url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $2, city= $3, url=$4`,
            [user, age, city, url]
        )
        .then(({ rows }) => {
            return rows;
        });
};

// update the data in users table
exports.updateDetails = function(user, first, last, email) {
    console.log("users table update");
    return db.query(
        `UPDATE users SET first=$2, last=$3, email=$4 WHERE users.id = $1`,
        [user, first, last, email]
    );
};

exports.updateUserPassword = function(user, first, last, email, password) {
    return db.query(
        `UPDATE users SET first=$2, last=$3, email=$4, password=$5 WHERE users.id = $1`,
        [user, first, last, email, password]
    );
};

// you delete the signature and then you delete him from the table
exports.deleteSignature = function(user) {
    return db.query(`DELETE FROM petition WHERE user_id=$1`, [user]);
};

exports.getProfileEdit = function(user) {
    return db
        .query(
            `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users
            JOIN user_profiles
            ON user_profiles.user_id = users.id
            WHERE users.id = $1`,
            [user]
        )
        .then(({ rows }) => {
            return rows;
        });
};
//app.post() if getProfileEdit else update details.
//join between users and user profiles first,last,age,email,city,url
