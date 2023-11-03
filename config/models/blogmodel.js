const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title:{
        require: true,
        type: String
    },
    textBody:{
        type: String,
        require: true
    },
    creationDateAndTime: {
        type: Date,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    isDeleted: {
        require: false,
        type: Boolean,
        default: false
    },
    deletionDateTime: {
        type: Date,
        require: false
    }
});

module.exports = mongoose.model("blogs", BlogSchema);