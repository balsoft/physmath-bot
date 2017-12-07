const globalHandlers = {
    /**
     * Антимат
     */
    "хуй|пизда|мудак|еба|ёба|пидор|бля": async function (text, author, match) {
        if (!author.extra.admin)
            return "**НЕ МАТЕРИСЬ**"
    },
    "аниме|мультик|антон": async function (text, author, match) {
        if (Math.random()>0.5) {return 'сам ты аниме'} else {return 'ОБОЖАЮ АНИМЕ, ОНО ИДЕАЛЬНО'}
    }
}
module.exports = globalHandlers