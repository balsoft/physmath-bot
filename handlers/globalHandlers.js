const globalHandlers = {
    /**
     * Антимат
     */
    "хуй|пизда|мудак|еба|ёба|пидор|бля": async function (text, author, match) {
        if (!author.extra.admin)
            return "**НЕ МАТЕРИСЬ**"
    }
}
module.exports = globalHandlers