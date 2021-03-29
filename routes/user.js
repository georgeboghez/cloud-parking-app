const express = require("express");
const session = require('express-session')
const {
    check,
    validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// const auth = require("../middleware/auth")
const CONSTANTS = require("../config/CONSTANTS")
const request = require("request")
// Imports the Google Cloud client library
const { Datastore } = require("@google-cloud/datastore");

// Creates a client
const datastore = new Datastore({
    projectId: 'test24-1561374558621', //eg my-project-0o0o0o0o'
    keyFilename: "test24-1561374558621-84e3e44e928c.json" //eg my-project-0fwewexyz.json
});

/**
* @method - POST
* @param - /signup
* @description - User SignUp
*/
router.post(
    "/signup",
    [
        check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("./login-signup.html", {
                errors: errors.array().map((err) => {
                    return err.msg;
                }),
                errorSignup: true
            });
        }
        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            return res.status(400).render("./login-signup.html", {
                errors: ['Captcha not completed'],
                errorSignup: true
            })
        }
        var secretKey = CONSTANTS.CAPTCHA_KEY
        var verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`
        request(verificationUrl, function (error, response, body) {
            body = JSON.parse(body)
            if (body.success !== undefined && !body.success) {
                
                return res.status(400).render("./login-signup.html", {
                    errors: ['Failed verification!'],
                    errorSignup: true
                })
            }
        })
        const {
            username,
            email,
            password
        } = req.body;
        try {
            const query = datastore.createQuery('User').filter("email", "=", email);
            const [users] = await datastore.runQuery(query);
            
            if (users.length > 0) {
                return res.status(400).render("./login-signup.html", {
                    errors: ["User Already Exists"],
                    errorSignup: true
                });
            }
            
            const kind = "User";
            const userKey = datastore.key([kind]);
            user = {
                key: userKey,
                data: {
                    "username": username,
                    "email" : email,
                    "password": password
                }
            };
            
            const salt = await bcrypt.genSalt(10);
            user.data.password = await bcrypt.hash(password, salt);
            
            // Saves the entity
            await datastore.save(user);
            
            const payload = {
                user: {
                    id: user.userKey
                }
            };
            jwt.sign(
                payload,
                "secret", {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err;
                    res.cookie("Authorization", token)
                    res.cookie("Email", email)
                    setTimeout(() => {
                        res.redirect("/")                            
                    }, 3000);
                }
                );
            } catch (err) {
                console.log(err.message);
                res.status(500).send("Error in Saving");
            }
        }
        );
        router.post(
            "/login",
            [
                check("email", "Please enter a valid email").isEmail(),
                check("password", "Please enter a valid password").isLength({
                    min: 6
                })
            ],
            async (req, res) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).render("./login-signup.html", {
                        errors: errors.array().map((err) => {
                            return err.msg;
                        })
                    });
                }
                if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
                    return res.status(400).render("./login-signup.html", {
                        errors: ['Captcha not completed']
                    })
                }
                var secretKey = CONSTANTS.CAPTCHA_KEY
                var verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`
                request(verificationUrl, function (error, response, body) {
                    body = JSON.parse(body)
                    if (body.success !== undefined && !body.success) {
                        
                        return res.status(400).render("./login-signup.html", {
                            errors: ['Failed verification!']
                        })
                    }
                })
                const {
                    email,
                    password
                } = req.body;
                try {
                    const query = datastore.createQuery('User').filter("email", "=", email);
                    
                    const [users] = await datastore.runQuery(query);
                    
                    if (users.length == 0) {
                        return res.status(400).render("./login-signup.html", {
                            errors: ["User does not exist"]
                        });
                    }
                    let user = users[0]
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch)
                    return res.status(400).render("./login-signup.html", {
                        errors: ["Incorrect Password"]
                    });
                    const payload = {
                        user: {
                            id: user.id
                        }
                    };
                    jwt.sign(
                        payload,
                        "secret", {
                            expiresIn: 3600
                        },
                        (err, token) => {
                            if (err) throw err;
                            res.cookie("Authorization", token)
                            res.cookie("Email", email)
                            res.redirect("/")
                        }
                        );
                    } catch (e) {
                        console.error(e);
                        res.status(500).json({
                            message: "Server Error"
                        });
                    }
                }
                );
                
                module.exports = router
