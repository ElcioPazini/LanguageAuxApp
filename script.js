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
            wordSearchTerm: ''
        };
    },

    computed: {
        filteredWords(){
            const searchTerm = this.wordSearchTerm.trim().toLocaleLowerCase();

            if (!searchTerm) {
                return this.words;
            }

            return this.words.filter(word => {
                return [word.name, word.translation]
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
        }
    },

    mounted() {
        this.getLanguages();
        this.selectLanguage(1);
    }

});

app.mount('#app');