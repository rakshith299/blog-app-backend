const express = require('express');
const {createBlog, getUserBlog, deleteBlog, editBlog, homePageBlogs} = require("../controllers/blogController");
const {isAuth} = require("../middlewares/authMiddleware");
const app = express();

app.post("/create-blog", isAuth, createBlog);
app.get("/get-user-blog", isAuth, getUserBlog);
app.delete("/delete-blog/:blogid", isAuth, deleteBlog);
app.put("/edit-blog", isAuth, editBlog);
app.get("/home-blogs", isAuth, homePageBlogs);

module.exports = app;