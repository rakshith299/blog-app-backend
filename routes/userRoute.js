const express = require("express");
const {registerUser, loginUser, getAllUsers} = require("../controllers/userController");
const { isAuth } = require("../middlewares/authMiddleware");
const app = express();

app.post("/register", registerUser);
app.post("/login", loginUser);
app.get("/get-all-users", isAuth, getAllUsers);

module.exports = app;