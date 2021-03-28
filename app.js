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
const nunjucks = require("nunjucks")
const cookieParser = require('cookie-parser')
var AdmZip = require("adm-zip")
var zlib = require("zlib")
const formidable = require("formidable");
const auth = require("./middleware/auth")
const { Datastore } = require("@google-cloud/datastore");

// Creates a client
const datastore = new Datastore({
  projectId: 'test24-1561374558621', //eg my-project-0o0o0o0o'
  keyFilename: "test24-1561374558621-84e3e44e928c.json" //eg my-project-0fwewexyz.json
});

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

app.get("/login", async (req, res) => {
  res.render("login-signup.html")
});

app.get("/favicon.ico", (req, res) => {
  res.setHeader("Content-Type", "image/x-ico")
  res.sendFile(__dirname + '/front/assets/images/parking.ico')
});

app.use("/user", user);

const topicName = 'MyTopic';
// const data = JSON.stringify({foo: 'bar'});

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const { json } = require("body-parser");

// Creates a client; cache this for further use
const pubSubClient = new PubSub({project_id: "test24-1561374558621", keyFilename: "test24-1561374558621-286fa15cf041.json"});

async function publishMessage(data) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);
  
  try {
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}

// publishMessage();

const subscriptionName = 'MySub';
const timeout = 10;

function listenForMessages() {
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);
  
  // Create an event handler to handle messages
  const messageHandler = function (message) {
    // Do something with the message
    console.log(`Message: ${message.toString()}`);
    console.log(message.publishTime)
    
    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };
  
  // Create an event handler to handle errors
  const errorHandler = function (error) {
    // Do something with the error
    console.error(`ERROR: ${error}`);
    throw error;
  };
  
  // Listen for new messages/errors until timeout is hit
  subscription.on('message', messageHandler);
  subscription.on('error', errorHandler);
  
  // setTimeout(() => {
  //   subscription.removeListener('message', messageHandler);
  //   subscription.removeListener('error', errorHandler);
  // }, timeout * 1000);
}

listenForMessages();

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

app.get("/locations", async (req, res) => {
  try {
    const query = datastore.createQuery('Location');
    const [locations] = await datastore.runQuery(query);
    
    return res.status(200).json(JSON.stringify({"locations" : locations}))
  } catch (e) {
    return res.status(418).json(JSON.stringify({"locations" : []}))
  }
})

app.get("/available-locations", async (req, res) => {
  try {
    const query = datastore.createQuery('Location').filter("availableSpots", ">", 0);
    const [locations] = await datastore.runQuery(query);
    
    return res.status(200).json(JSON.stringify({"locations" : locations}))
  } catch (e) {
    return res.status(418).json(JSON.stringify({"locations" : []}))
  }
})

app.post("/new-location", async (req, res) => {
  try {
    const kind = "Location";
    const locationKey = datastore.key([kind]);
    let location = {
      key: locationKey,
      data: {
        "north": 47.1575,
        "south" : 47.1565,
        "east": 27.5875,
        "west": 27.5865,
        "center": {latitude: 47.157, longitude: 27.587},
        "name": "Palatul Culturii",
        "availableSpots": 100,
        "allSpots": 0
      }
    };
    
    await datastore.save(location);
    
    return res.status(200).json(JSON.stringify({"message" : "success"}))
  } catch (e) {
    console.log(e.message)
    return res.status(501).json(JSON.stringify({"message" : e.message}))
  }
})

app.put("/book-spot", async (req, res) => {
  try {
    let name = req.body.name
    // const query = datastore.createQuery('Location').filter('name', '=', name);
    const query = datastore.createQuery('Location');
    const [locations] = await datastore.runQuery(query);
    let desiredLocation;
    for(let location of locations) {
      if(location.name == name) {
        desiredLocation = location;
        break;
      }
    }
    if(!desiredLocation) {
      return res.status(404).json(JSON.stringify({"message": "not found", "locations" : []}))
    }
    if(desiredLocation.availableSpots > 0) {
      desiredLocation.availableSpots -= 1
      await datastore.save(desiredLocation);
    }
    return res.status(200).json(JSON.stringify({"spots" : desiredLocation.availableSpots}))
  } catch (e) {
    return res.status(418).json(JSON.stringify({"locations" : []}))
  }
})

app.get("/", auth, async (req, res) => {
  try {
    let cookies = parseCookies(req)
    let email = cookies["Email"]
    
    res.render("./map.html", {
      messages: []
    })
  } catch (e) {
    res.render("login-signup.html")
  }
})

app.get('/logout', (req, res) => {
  res.clearCookie("Authorization")
  res.clearCookie("Email")
  res.redirect('/')
})

app.get('*', function (req, res) {
  res.status(404).render('404.html');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
