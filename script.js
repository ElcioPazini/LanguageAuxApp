const url = "http://localhost:3000";

const app = Vue.createApp({

    data() {
        return {
            languages: [],
            words: [],
            newLanguage: '',
            selectedLanguageId: null,
            newWordName: '',
            newWordTranslation: '',
            newWordDescription: '',
            wordError: '',
            wordSearchTerm: '',
            practiceOpen: false,
            practiceWord: null,
            practiceOptions: [],
            practiceIncorrectOptions: [],
            practiceAnswered: false,
            practiceError: ''
        };
    },

    computed: {
        filteredWords(){
            const searchTerm = this.wordSearchTerm.trim().toLocaleLowerCase();

            if (!searchTerm) {
                return this.words;
            }

            return this.words.filter(word => {
                return [word.name, word.translation, word.description]
                    .some(value => String(value || '').toLocaleLowerCase().includes(searchTerm));
            });
        }
    },

    methods: {
        selectLanguage(id){
            this.selectedLanguageId = id;
            this.wordSearchTerm = '';
            this.getWordsByLanguageId(id);
        },
        async getLanguages(){
            const response = await fetch(url + "/languages");
            this.languages = await response.json();
        },
        async insertLanguage(name){
            await fetch(url + "/languages", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name
                })
            });

            this.newLanguage = '';
            this.getLanguages();
        },
        async deleteLanguage(id){
            await fetch(url + "/languages/" + id, {
                method: 'DELETE'
            });

            this.getLanguages();
        },
        async getWordsByLanguageId(languageId){
            const response = await fetch(url + "/words/" + languageId);
            this.words = await response.json();
        },
        async insertWord(name, translation, description, languageId){
            const response = await fetch(url + "/words", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    translation: translation,
                    description: description,
                    languageId: languageId
                })
            });

            if (!response.ok) {
                this.wordError = response.status === 400
                    ? 'This word already exists for this language.'
                    : 'Could not add the word. Please try again.';
                return;
            }

            this.wordError = '';
            this.newWordName = '';
            this.newWordTranslation = '';
            this.newWordDescription = '';
            
            await this.getWordsByLanguageId(languageId);
        },
        async createWord(){
            const name = this.newWordName.trim();
            const translation = this.newWordTranslation.trim();

            if (!name || !translation) {
                this.wordError = 'Word and translation are required.';
                return;
            }

            await this.insertWord(
                name,
                translation,
                this.newWordDescription,
                this.selectedLanguageId
            );
        },
        async deleteWord(id){
            await fetch(url + "/words/" + id, {
                method: 'DELETE'
            });
            
            this.getWordsByLanguageId(this.selectedLanguageId);
        },
        openPractice(){
            this.practiceOpen = true;
            this.nextPracticeWord();
        },
        closePractice(){
            this.practiceOpen = false;
        },
        nextPracticeWord(){
            const availableWords = this.words.filter(word => {
                return typeof word.translation === 'string' && word.translation.trim();
            });
            const distinctTranslations = [...new Set(
                availableWords.map(word => word.translation.trim())
            )];

            if (distinctTranslations.length < 4) {
                this.practiceWord = null;
                this.practiceOptions = [];
                this.practiceError = 'Add at least four words with distinct translations to practice this language.';
                return;
            }

            const previousWordId = this.practiceWord && this.practiceWord.id;
            const questionWords = availableWords.filter(word => word.id !== previousWordId);
            const pool = questionWords.length > 0 ? questionWords : availableWords;
            const word = pool[Math.floor(Math.random() * pool.length)];
            const distractors = [...new Set(
                availableWords
                    .map(item => item.translation.trim())
                    .filter(translation => translation !== word.translation.trim())
            )];

            this.practiceWord = word;
            this.practiceOptions = this.shufflePracticeOptions([
                { translation: word.translation.trim(), correct: true },
                ...this.shufflePracticeOptions(distractors)
                    .slice(0, 3)
                    .map(translation => ({ translation, correct: false }))
            ]);
            this.practiceIncorrectOptions = [];
            this.practiceAnswered = false;
            this.practiceError = '';
        },
        shufflePracticeOptions(options){
            const shuffled = [...options];

            for (let index = shuffled.length - 1; index > 0; index--) {
                const randomIndex = Math.floor(Math.random() * (index + 1));
                [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
            }

            return shuffled;
        },
        choosePracticeOption(index){
            if (this.practiceAnswered || this.practiceIncorrectOptions.includes(index)) {
                return;
            }

            if (this.practiceOptions[index].correct) {
                this.practiceAnswered = true;
                return;
            }

            this.practiceIncorrectOptions.push(index);
        }
    },

    mounted() {
        this.getLanguages();
        this.selectLanguage(1);
    }

});

app.mount('#app');