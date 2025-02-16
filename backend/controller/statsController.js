const statsService = require("../services/statsService");

exports.getAllUserStats = async (req, res) => {
    try {
        const stats = await statsService.fetchAllUserStats();
        if (stats.length === 0) {
            return res.status(200).json({ message: "No user expenses available" });
        }
        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
