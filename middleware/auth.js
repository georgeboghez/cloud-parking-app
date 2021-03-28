const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.cookies["Authorization"];
    if (!token) return res.redirect("/login");
    try {
        const decoded = jwt.verify(token, "secret");
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.redirect("/login");
    }
};