const formidable = require("formidable");
const zlib = require('zlib');
const fs = require('fs');

const {
    check,
    validationResult
} = require("express-validator");
const Post = require("../model/Post")
const express = require("express")

const router = express.Router();

router.get("/lastPosts", async (req, res) => {
    try {
        let posts = await Post.find({})
        res.json(posts)
    } catch (e) {
        console.log(e.message)
        res.send({
            message: "Error in Fetching posts"
        });
    }
})

router.post(
    "/submitPost", async (req, res) => {
        try {
            const form = formidable({
                multiples: true
            });

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error('Error', err)
                    return res.status(400).json({
                        "error": "form-error"
                    });
                }
                const {
                    title,
                    description,
                    textContent
                } = fields;

                let errs = {};

                if (title.length == 0) {
                    errs.titleErr = "Please enter a title";
                }
                if (description.length == 0) {
                    errs.descriptionErr = "Please enter a description";
                }
                if (textContent.length == 0) {
                    errs.textContentErr = "Please enter the text content";
                }

                if (Object.keys(errs).length != 0) {
                    console.error('Error', errs)
                    return res.status(400).json(errs);
                }


                try {
                    let post = new Post({
                        title,
                        description,
                        textContent
                    })
                    if (files.image.size > 0) {
                        post.imagePath = post.publishedDate.getUTCFullYear().toString() + '-' + post.publishedDate.getUTCMonth().toString() + '-' + post.publishedDate.getUTCDate().toString() + '-' + post.publishedDate.getUTCHours().toString() + '-' + post.publishedDate.getUTCMinutes().toString() + '-' + post.publishedDate.getUTCSeconds().toString() + '.jpg.gz';

                        var inp = fs.readFileSync(files.image.path);
                        let compressedImg = zlib.gzipSync(inp);
                        var out = fs.writeFileSync(__dirname + '\\..\\front\\assets\\postImages\\' + post.publishedDate.getUTCFullYear().toString() + '-' + post.publishedDate.getUTCMonth().toString() + '-' + post.publishedDate.getUTCDate().toString() + '-' + post.publishedDate.getUTCHours().toString() + '-' + post.publishedDate.getUTCMinutes().toString() + '-' + post.publishedDate.getUTCSeconds().toString() + '.jpg.gz', compressedImg, {
                            flag: "a+"
                        });
                    }
                    await post.save();
                    res.redirect("/")
                } catch (e) {
                    console.log(e.message)
                    res.send({
                        message: "hmm"
                    })
                }
            })
        } catch (error) {
            console.log(error.message)

        }

    })

router.get(/[0-9a-fA-F]+/, async (req, res) => {
    try {
        var post = await Post.findOne({
            _id: req.url.substring(1)
        });

        if (!post) {
            res.render("404.html", {
                goToPage: "/login",
                pageName: "404"
            })
        }

        res.render("post.html", {
            post: post,
            goToPage: "/login",
            pageName: "post"
        });
    } catch (e) {
        console.log(e.message);
        res.render("404.html", {
            goToPage: "/login",
            pageName: "404"
        })
    }
});

module.exports = router