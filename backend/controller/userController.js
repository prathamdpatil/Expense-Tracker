const userService = require("../services/userService")

const getUsers = async (req, res) => {
    console.log("controller")
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

module.exports = { getUsers };