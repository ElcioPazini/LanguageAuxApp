const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '') {
        loadHtml(res);
    }else if (req.url === '/script.js') {
        loadScript(res);
    } else if (req.url === '/style.css') {
        loadCss(res)
    }
    else if (req.method === 'GET' && req.url === '/languages') {
        handleGetLanguages(res);
    } else if (req.method === 'POST' && req.url === '/languages') {
        handlePostLanguage(res, req);
    } else if (req.method === 'DELETE' && req.url.startsWith('/languages/')) {
        handleDeleteLanguage(res, req);
    }else if (req.method === 'GET' && req.url.startsWith('/words/')) {
        handleGetWordsByLangId(res, req);
    }else if (req.method === 'POST' && req.url === '/words') {
        handlePostWord(res, req);
    }else if (req.method === 'DELETE' && req.url.startsWith('/words/')) {
        handleDeleteWord(res, req);
    } else {
        res.statusCode = 404;
        res.end('No route');
    }

});

function handleDeleteLanguage(res, req){
    const languageId = parseInt(req.url.split('/')[2]);

    deleteLanguage(languageId);

    res.end('Language deleted');
}

function handleDeleteWord(res, req){
    const wordId = parseInt(req.url.split('/')[2]);

    deleteWord(wordId);

    res.end('Word deleted');
}

function handlePostLanguage(res, req){
    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        const language = JSON.parse(body);
        insertLanguage(language.name);

        res.end('Language added');
    });
}

function handlePostWord(res, req){
    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        const word = JSON.parse(body);
        const success = insertWord(word.name, word.translation, word.description, word.languageId);

        if (success) {
            res.end('Word added');
        } else {
            res.statusCode = 400;
            res.end('Word already exists');
        }
    });
}

function handleGetLanguages(res){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getLanguages()));
}

function handleGetWordsByLangId(res, req){
    res.setHeader('Content-Type', 'application/json');

    const languageId = parseInt(req.url.split('/')[2]);
    const words = getWords();

    if(!words)
        return
    
    var filteredWordsByLangId = words.filter(function(word){
        return word.languageId === languageId
    });

    res.end(JSON.stringify(filteredWordsByLangId));
}

function getLanguages(){
    var languages = fs.readFileSync('languages.json', 'utf-8');

    return JSON.parse(languages);
}

function getWords(){
    var words = fs.readFileSync('words.json', 'utf-8');

    return JSON.parse(words);
}

function insertLanguage(name){
    var languages = getLanguages();
    for(i = 1; i < 999; i++){
        var existingLanguage = genericFilterFunction(languages, 'id', i)[0];

        if(!existingLanguage){
            var newLang = {
                "id": i, 
                "name": name
            };

            languages.push(newLang);

            //Im using this value because I'll not create so many languages
            i = 1000;
        }
    }

    writeLanguagesToFileAsync(languages)
}

function insertWord(name, translation, description, languageId){
    var words = getWords();

    var existingWord = words.filter(function(word){
        return word.languageId === languageId && word.name === name;
    });

    if(existingWord.length > 0){
        return false;
    }

    for(i = 1; i < 9999; i++){
        existingWord = genericFilterFunction(words, 'id', i)[0];
        
        if(!existingWord){
            var newWord = {
                "id": i,
                "name": name,
                "translation": translation,
                "description": description,
                "languageId": languageId
            };

            words.push(newWord);
            i = 10000;
        }
    }

    writeWordsToFileAsync(words)
    return true;
}

function deleteLanguage(languageId){
    var languages = getLanguages();

    var languageIndex = languages.indexOf(genericFilterFunction(languages, 'id', languageId)[0]);

    languages.splice(languageIndex, 1);

    writeLanguagesToFileAsync(languages)
}

function deleteWord(wordId){
    var words = getWords();

    var wordIndex = words.indexOf(genericFilterFunction(words, 'id', wordId)[0]);

    words.splice(wordIndex, 1);

    writeWordsToFileAsync(words);
}

function loadHtml(res){
    const html = fs.readFileSync('LanguageApp.html');
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
}

function loadScript(res){
    const script = fs.readFileSync('script.js');
    res.setHeader('Content-Type', 'application/javascript');
    res.end(script);
}

function loadCss(res){
    const css = fs.readFileSync('style.css');
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
}

function writeLanguagesToFileAsync(languages){
    fs.writeFileSync('languages.json',
        JSON.stringify(languages)
    )
}

function writeWordsToFileAsync(words){
    fs.writeFileSync('words.json',
        JSON.stringify(words)
    )
}

function genericFilterFunction (array, key, value){
    return array.filter(obj => obj[key] === value);
}

server.listen(3000, () => {
    console.log('Runing in http://localhost:3000');
});