const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

exports.hash = password => genSalt().then(salt => hash(password, salt)); // it will have the password

exports.compare = promisify(bcrypt.compare); //is gonna be on the log in and return us true or false
