const { Translate } = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate({
    projectId: 'test24-1561374558621', //eg my-project-0o0o0o0o'
    keyFilename: "test24-1561374558621-84e3e44e928c.json" //eg my-project-0fwewexyz.json
});

async function translateTextWithModelSample(text, target) {
    const model = 'nmt';
    const options = {
        to: target,
        model: model,
    };
    
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations] = await translate.translate(text, options);
    translations = Array.isArray(translations) ? translations : [translations];
    return translations
    // translations.forEach((translation, i) => {
    //     console.log(`(${target}) ${translation}`);
    // });
    // translateTextWithModel();
}

// var text = "Buna, ma numesc Vlad!";
// var target_lang = "en"
// translateTextWithModelSample(text, target_lang);

module.exports = {translate: translateTextWithModelSample}