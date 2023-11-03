const express = require("express");
require("dotenv").config();
const UserSchema = require("./models/usermodel");
const Blog = require("./models/blogmodel");
const cors = require("cors");
const app = express();

const db = require("./config/db");
const userRoute = require("./routes/userRoute");
const blogRoute = require("./routes/blogRoute");
const followRoute = require("./routes/followRoute");
const { cleanUpBin } = require("./utils/cron");

app.use(express.json());

app.use(cors({
    origin: "*"
}))

let PORT = process.env.PORT;

app.use("/user", userRoute); // localhost:8000/user/register, localhost:8000/user/login  //localhost:8000/user/get-all-users
app.use("/blog", blogRoute); // localhost:8000/blog/create-blog, localhost:8000/blog/get-user-blog, localhost:8000/blog/edit-blog, localhost:8000/blog/delete-blog
app.use("/connection", followRoute); //localhost:8000/connection/follow  //localhost:8000/connection/unfollow  


app.listen(PORT, () => {
    console.log("Port is running at", PORT);
    cleanUpBin()
})