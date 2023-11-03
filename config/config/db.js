const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOOSE_URI)
.then(() => {
    console.log("Database is connected");
})
.catch((err) => {
    console.log("Error in connecting to Database",err);
})