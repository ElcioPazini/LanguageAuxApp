const url = "http://localhost:3000";

const app = Vue.createApp({

    data() {
        return {
            languages: [],
            newLanguage: ''
        };
    },

    methods: {
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
        }
    },

    mounted() {
        this.getLanguages();
    }

});

app.mount('#app');