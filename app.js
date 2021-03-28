// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const post = require("./routes/post");
const nunjucks = require("nunjucks")
const cookieParser = require('cookie-parser')
var AdmZip = require("adm-zip")
var zlib = require("zlib")
const formidable = require("formidable");
const Post = require("./model/Post");
const auth = require("./middleware/auth")

const InitiateMongoServer = require("./config/db");


InitiateMongoServer();
const app = express();

const postsPerPage = 5;

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(cookieParser());
app.use(bodyParser.json());

nunjucks.configure('front', {
  autoescape: true,
  watch: true,
  express: app,
})

app.get(/assets\/postImages\/*/, (req, res) => {
  let img = fs.readFileSync(__dirname + "/front" + req.url)
  let unzipped = zlib.unzipSync(img)
  img = zlib.gzipSync(unzipped)
  res.setHeader('Content-Type', 'image/jpg');
  res.setHeader('Content-Encoding', 'gzip');
  res.send(img)
})

app.use('/assets/', express.static(__dirname + '/front/assets/', {
  etag: true,
  // maxage: '1h'
}))

function parseCookies (request) {
  var list = {},
  rc = request.headers.cookie;
  
  rc && rc.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  
  return list;
}

app.get("/", async (req, res) => {
  var posts = await Post.find({}, {
    title: 1,
    description: 1,
    publishedDate: 1,
    imagePath: 1,
  }).sort({
    publishedDate: -1
  }).limit(postsPerPage);
  
  // var numberOfPages = Math.ceil(await Post.countDocuments({}) / postsPerPage);
  
  res.render("index.html", {
    posts: posts,
    currentPage: 1,
    goToPage: "/login",
    pageName: "home"
  })
});

app.get(/page\/[1-9][0-9]?/, async (req, res) => {
  try {
    var pageNumber = parseInt(req.url.toString().substring(6));
    var numberOfPostsToSkip = pageNumber * postsPerPage - postsPerPage;
    var posts = await Post.find({}, {
      title: 1,
      description: 1,
      publishedDate: 1
    }).sort({
      publishedDate: -1
    }).skip(numberOfPostsToSkip).limit(postsPerPage);
    
    res.render("index.html", {
      posts: posts,
      currentPage: pageNumber,
      postsPerPage: postsPerPage,
      goToPage: "/",
      pageName: "home"
    })
  } catch (e) {
    console.log(e.message);
    res.redirect("/")
  }
});

app.get("/signup", (req, res) => {
  res.render("signup.html", {
    goToPage: "/",
    pageName: "signup"
  })
});

app.get("/login", (req, res) => {
  res.render("login.html", {
    goToPage: "/",
    pageName: "login"
  })
});

app.get("/favicon.ico", (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml")
  res.sendFile(__dirname + '/front/assets/images/LOGO-02.svg')
});

app.use("/user", user);

app.use("/post", post);

const topicName = 'MyTopic';
// const data = JSON.stringify({foo: 'bar'});

// Imports the Google Cloud client library
// const {PubSub} = require('@google-cloud/pubsub');
const { json } = require("body-parser");

// Creates a client; cache this for further use
// const pubSubClient = new PubSub();

// async function publishMessage(data) {
//   // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
//   const dataBuffer = Buffer.from(data);
  
//   try {
//     const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
//     console.log(`Message ${messageId} published.`);
//   } catch (error) {
//     console.error(`Received error while publishing: ${error.message}`);
//     process.exitCode = 1;
//   }
// }

// // publishMessage();

// const subscriptionName = 'MySub';
// const timeout = 10;

// function listenForMessages() {
//   // References an existing subscription
//   const subscription = pubSubClient.subscription(subscriptionName);
  
//   // Create an event handler to handle messages
//   const messageHandler = function (message) {
//     // Do something with the message
//     console.log(`Message: ${message.toString()}`);
//     console.log(message.publishTime)
    
//     // "Ack" (acknowledge receipt of) the message
//     message.ack();
//   };
  
//   // Create an event handler to handle errors
//   const errorHandler = function (error) {
//     // Do something with the error
//     console.error(`ERROR: ${error}`);
//     throw error;
//   };
  
//   // Listen for new messages/errors until timeout is hit
//   subscription.on('message', messageHandler);
//   subscription.on('error', errorHandler);
  
//   // setTimeout(() => {
//   //   subscription.removeListener('message', messageHandler);
//   //   subscription.removeListener('error', errorHandler);
//   // }, timeout * 1000);
// }

// listenForMessages();

app.post("/sendMessage", async (req, res) => {
  try {
    const form = formidable({
      multiples: true
    });
    var cookies = parseCookies(req)
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error', err)
        return res.status(400).json({
          "error": "form-error"
        });
      }
      const {
        message
      } = fields;
      
      let errs = {};
      
      if (message.length == 0) {
        errs.textContentErr = "Please enter the text content";
      }
      
      if (Object.keys(errs).length != 0) {
        console.error('Error', errs)
        return res.status(400).json(errs);
      }
      
      let email = cookies["Email"]
      publishMessage(JSON.stringify({"from": email, "to": "gvb@gmail.com", "message" : message}))
      res.redirect("/")
    })
  } catch (error) {
    console.log(error.message) 
  }
})

app.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    // res.clearCookie("Authorization")
    let cookies = parseCookies(req)
    let email = cookies["Email"]
    console.log(email)
    res.render("./submit-post.html", {
      goToPage: "/",
      messages: [],
      pageName: "submit"
    })
  } catch (e) {
    console.log(e.message)
    res.send({
      message: "Error in Fetching user"
    });
  }
})

app.post('/submit', (req, res) => {
  if (
    req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response'] === '' ||
    req.body['g-recaptcha-response'] === null
  ) {
    return res.json({ respCode: 1, error: 'Captcha not completed' })
  }
  console.log({
    name: req.body.name
  })
  var secretKey = process.env.secret_key
  var verificationUrl =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    req.body['g-recaptcha-response']
  request(verificationUrl, function (error, response, body) {
    body = JSON.parse(body)
    if (body.success !== undefined && !body.success) {
      return res.json({ respCode: 1, error: 'Failed verification!' })
    }
  })
  res.json({ respCode: 0, message: 'success!' })
  //   res.send('Entry submitted!')
})

app.get('*', function (req, res) {
  res.status(404).render('404.html', {
    goToPage: "/",
    pageName: "404"
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
