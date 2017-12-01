const globalHandlers = {
    /**
     * Антимат
     */
    "хуй|пизда|мудак|еб|ёб": async function (text, author, match) {
        return "**НЕ МАТЕРИСЬ**"
    }
}
module.exports = globalHandlers