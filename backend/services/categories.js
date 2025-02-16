const db = require("../config/db");

const getAllCategories = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM categories", (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

module.exports = { getAllCategories };
