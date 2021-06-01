var sdk = require("microsoft-cognitiveservices-speech-sdk");
const { Buffer } = require("buffer");
const { PassThrough } = require("stream");
const fs = require("fs");
const dotenv = require("dotenv");
const CONSTANTS = require("./config/CONSTANTS")
dotenv.config();

function textToSpeech(text, filename, language, req, res) {
  var bufferStream = null;
  var subscriptionKey = CONSTANTS.SUBSCRIPTION_KEY;
  var serviceRegion = CONSTANTS.REGION;

  let audioConfig = null;

  if (filename) {
    audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
  }

  var speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );

  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  var ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${language}">
    ${text}
  </voice>
  </speak>`;

  synthesizer.speakSsmlAsync(
    ssml,
    function (result) {
      const { audioData } = result;

      synthesizer.close();

      if (filename) {
        // return stream from file
        const audioFile = fs.createReadStream(filename);
      } else {
        // return stream from memory
        // bufferStream = new PassThrough();
        // bufferStream.end(Buffer.from(audioData));
        res.write(Buffer.from(audioData), "binary");
        res.end(undefined, "binary");
      }

      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("Synthesis finished.");
      } else {
        console.error("Speech synthesis cancelled, " + result.errorDetails);
      }
      // synthesizer.close();
      synthesizer = undefined;
    },
    function (err) {
      console.trace("err - " + err);
      synthesizer.close();
      synthesizer = undefined;
    }
  );
  console.log("Now synthesizing to: " + filename);
  return bufferStream;
}

textToSpeech("Pe drumurile nationale, aprindeti luminile de intalnire", "luminile.wav", "ro-RO-AlinaNeural");

module.exports = textToSpeech;
