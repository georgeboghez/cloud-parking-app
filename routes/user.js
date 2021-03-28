const express = require("express");
const session = require('express-session')
const {
    check,
    validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const auth = require("../middleware/auth")
const CONSTANTS = require("../config/CONSTANTS")
const request = require("request")
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
            return res.status(400).render("./signup.html", {
                errors: errors.array().map((err) => {
                    return err.msg;
                })
            });
        }
        if (
            req.body['g-recaptcha-response'] === undefined ||
            req.body['g-recaptcha-response'] === '' ||
            req.body['g-recaptcha-response'] === null
            ) {
                return res.json({ respCode: 1, error: 'Captcha not completed' })
            }
            var secretKey = CONSTANTS.CAPTCHA_KEY
            var verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`
            request(verificationUrl, function (error, response, body) {
                body = JSON.parse(body)
                if (body.success !== undefined && !body.success) {
                    return res.json({ respCode: 1, error: 'Failed verification!' })
                }
                else {
                    
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
                    return res.status(400).render("./signup.html", {
                        errors: ["User Already Exists"]
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
                        res.cookie("Authorization", token)
                        res.cookie("Email", email)
                        if (err) throw err;
                        setTimeout(() => {
                            res.status(200).redirect('/');                        
                        }, 2000);
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
                        return res.json({ respCode: 1, error: 'Captcha not completed' })
                    }
                    var secretKey = CONSTANTS.CAPTCHA_KEY
                    var verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`
                    
                    request(verificationUrl, function (error, response, body) {
                        body = JSON.parse(body)
                        if (body.success !== undefined && !body.success) {
                            return res.json({ respCode: 1, error: 'Failed verification!' })
                        }
                        else {
                            
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
                        if (!isMatch) {
                            return res.status(400).render("./login-signup.html", {
                                errors: ["Incorrect Password"],
                                pageName: "home"
                            });
                        }
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
                                res.cookie("Authorization", token)
                                res.cookie("Email", email)
                                if (err) throw err;
                                res.status(200).redirect("/")
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
                    /**
                    * @method - POST
                    * @description - Get LoggedIn User
                    * @param - /user/me
                    */
                    router.get("/me", auth, async (req, res) => {
                        try {
                            // request.user is getting fetched from Middleware after token authentication
                            // res.clearCookie("Authorization")
                            res.render("./map.html")
                        } catch (e) {
                            console.log(e.message)
                            res.send({
                                message: "Error in Fetching user"
                            });
                        }
                    })
                    
                    module.exports = router