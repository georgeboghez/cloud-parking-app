const speech = require('@google-cloud/speech')

const client = new speech.SpeechClient(
    {
        projectId: 'test24-1561374558621', //eg my-project-0o0o0o0o'
        keyFilename: "test24-1561374558621-84e3e44e928c.json" //eg my-project-0fwewexyz.json
    }
    )
    
    async function quickstart () {
        const gcsUri = 'gs://cloud-samples-data/speech/brooklyn_bridge.raw';
        
        const audio = {
            uri: gcsUri
        }
        
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US'
        }
        
        const request = {
            audio: audio,
            config: config
        }
        
        const [response] = await client.recognize(request)
        const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n')
        console.log(`Transcription: ${transcription}`)
    }
    quickstart()