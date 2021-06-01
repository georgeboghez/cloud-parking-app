x = async function (text, language) {
    const fetch = require('node-fetch');
    
    const options = {
    };
    
    const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${language}`
    var response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${language}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': 'e943b6e3b1ee497d9722e5520fa2e0c3'
        },
        body: JSON.stringify([{"Text": text}])
    })
    var data = await response.json();
    
    return data[0].translations[0].text;
}

module.exports = x