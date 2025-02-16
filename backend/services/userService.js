const db = require("../config/db")

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM users", (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

module.exports = { getAllUsers };