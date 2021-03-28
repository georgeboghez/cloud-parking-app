const mongoose = require("mongoose");
const MONGOURI = "mongodb+srv://aaa:bbb@cluster0.jqejp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Successfully connected to the database!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;