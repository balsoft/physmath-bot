const globalHandlers = {
    /**
     * Антимат
     */
    "хуй|пизда|мудак|еба|ёба|пидор|бля": async function (text, author, match) {
        return "**НЕ МАТЕРИСЬ**"
    }
}
module.exports = globalHandlers