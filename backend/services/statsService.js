const db = require("../config/db");

exports.fetchAllUserStats = async () => {
    return new Promise((resolve, reject) => {
        const getUsersQuery = `
            SELECT DISTINCT u.id, u.name 
            FROM users u 
            JOIN expenses e ON u.id = e.user_id; 
        `;

        db.query(getUsersQuery, async (err, users) => {
            if (err) {
                return reject({ error: err.message });
            }
            if (users.length === 0) {
                return resolve([]);
            }

            const statsPromises = users.map(user => {
                return new Promise((res, rej) => {
                    const topDaysQuery = `
                        SELECT date, SUM(amount) AS total_spent 
                        FROM expenses 
                        WHERE user_id = ? 
                        GROUP BY date 
                        ORDER BY total_spent DESC 
                        LIMIT 3;
                    `;

                    const monthlyChangeQuery = `
                        SELECT 
                            IFNULL(SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END), 0) AS prev_month,
                            IFNULL(SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE) THEN amount ELSE 0 END), 0) AS current_month,
                            CASE 
                                WHEN SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END) = 0 
                                THEN NULL 
                                ELSE 
                                    ((SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE) THEN amount ELSE 0 END) - 
                                      SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END)) / 
                                      SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END)) 
                                    * 100
                            END AS percentage_change
                        FROM expenses
                        WHERE user_id = ?
                        GROUP BY user_id;
                    `;

                    const nextMonthPredictionQuery = `
                        SELECT AVG(monthly_spent) AS predicted_next_month 
                        FROM (
                            SELECT SUM(amount) AS monthly_spent 
                            FROM expenses 
                            WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) 
                            GROUP BY MONTH(date)
                        ) AS last_3_months;
                    `;

                    Promise.all([
                        new Promise((r, j) => db.query(topDaysQuery, [user.id], (err, result) => err ? j(err) : r(result))),
                        new Promise((r, j) => db.query(monthlyChangeQuery, [user.id], (err, result) => err ? j(err) : r(result[0]))),
                        new Promise((r, j) => db.query(nextMonthPredictionQuery, [user.id], (err, result) => err ? j(err) : r(result[0])))
                    ]).then(([topDays, monthlyChange, nextMonthPrediction]) => {
                        res({
                            user,
                            topDays,
                            monthlyChange,
                            nextMonthPrediction
                        });
                    }).catch(rej);
                });
            });

            Promise.all(statsPromises)
                .then(allStats => resolve(allStats))
                .catch(error => reject({ message: "Error fetching user stats", error }));
        });
    });
};