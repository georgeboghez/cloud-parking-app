const mongoose = require("mongoose");
const fs = require("fs");

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    textContent: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: new String("Andrei Grecu")
    },
    publishedDate: {
        type: Date,
        default: Date.now()
    },
    category: {
        type: String,
        default: new String("Diverse")
    }, 
    imagePath: {
        type: String,
        default: new String("defaultImage.jpg.gz")
    }
});

module.exports = mongoose.model("post", PostSchema);