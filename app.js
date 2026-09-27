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

function handleGetLanguages(res){
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(getLanguages()));
}

function getLanguages(){
    var languages = fs.readFileSync('languages.json', 'utf-8');

    return JSON.parse(languages);
}

function insertLanguage(name){
    var languages = getLanguages();
    for(i = 1; i < 999; i++){
        var existingLanguage = genericFilterFunction(languages, 'id', i);

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

function genericFilterFunction (array, key, value){
    return array.filter(obj => obj[key] === value);
}

function deleteLanguage(languageId){
    var languages = getLanguages();

    var languageIndex = languages.indexOf(genericFilterFunction(languages, 'id', languageId)[0]);

    languages.splice(languageIndex, 1);

    writeLanguagesToFileAsync(languages)
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

server.listen(3000, () => {
    console.log('Runing in http://localhost:3000');
});