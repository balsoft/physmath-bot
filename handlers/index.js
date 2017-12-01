const {
    Member
} = require('../abstract')

const directHandlers = require('./directHandlers')
/**
 * @param {string} text Текст сообщения
 * @param {Member} author Автор сообщения
 * @returns {string} ответ
 */
async function handleDirectMessage(text, author) {
    for (i in directHandlers) {
        if (RegExp(i, 'i').test(text)) {
            return await directHandlers[i](text, author, text.match(RegExp(i, 'i')))
        }
    }
    return `Я вас не понял`
}
const globalHandlers = require('./globalHandlers')
/**
 * @param {string} text Текст сообщения
 * @param {Member} author Автор сообщения
 * @returns {string} ответ
 */
async function handleGlobalMessage(text, author) {
    for (i in globalHandlers) {
        if (RegExp(i, 'i').test(text)) {
            return await globalHandlers[i](text, author, text.match(RegExp(i, 'i')))
        }
    }
    return undefined
}

module.exports = {
    handleDirectMessage,
    handleGlobalMessage
}