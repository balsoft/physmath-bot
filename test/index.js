const {
    handleDirectMessage,
    handleGlobalMessage
} = require('../handlers')

const {
    Member
} = require('../abstract')
const assert = require('assert')
async function main() {
    const DATABASE_URL = process.env["DATABASE_URL"]
    console.log(DATABASE_URL)
    const {
        Pool
    } = require('pg')
    global.db = new Pool({
        connectionString: DATABASE_URL
    });
    await global.db.query(`CREATE TABLE members (name TEXT PRIMARY KEY, birthdate DATE, extra JSON)`)
    await new Member('John D.', new Date(2000, 05, 15), {
        admin: true
    }).push()
    await new Member('Иванов И.И.', new Date(1999, 01, 01), null).push()
    await new Member('Петров П.П.', new Date(1999, 02, 02), null).push()
    await new Member('Сидоров С.С.', new Date(1999, 03, 03), null).push()
    return true;
}
before(main)
describe('Members', () => {
    describe('DB interaction', () => {
        it('Should get all members', async function () {
            assert.ok(await Member.getAll())
        })
        it('Should find members', async function () {
            assert.equal((await Member.findByName('Петров')).name, 'Петров П.П.')
        })
        it('Should find members by extra', async function () {
            assert.equal((await Member.findBy('admin', true)).name, 'John D.')
        })
        it('Should push data to DB', async function () {
            await new Member('Новый Ч.К.', new Date(), null).push()
            assert.equal((await Member.findByName('Новый')).name, 'Новый Ч.К.')
        })
    })
})

describe('Message handlers', () => {
    describe('direct', () => {
        describe('ping', () => {
            it('Should return pong', async function () {
                assert.equal(await handleDirectMessage('ping'), 'pong')
            })
        })
        describe('echo', () => {
            it('Should echo back the argument', async function () {
                assert.equal(await handleDirectMessage('echo Hello!'), 'Hello!')
            })
            it('Should react to russian "скажи"', async function () {
                assert.equal(await handleDirectMessage('скажи Привет!'), 'Привет!')
            })
        })
        describe('др', () => {
            it('Should work fine on "ближайший"', async function () {
                assert.ok(await handleDirectMessage('др ближайший'))
            })
            it('Should work fine on names', async function () {
                assert.ok(await handleDirectMessage('др Петров'))
            })
            it('Should work with order reversed', async function () {
                const arr = await Promise.all([handleDirectMessage('Петров др'), handleDirectMessage('др Петров')])
                assert.equal(arr[0], arr[1])
            })
            it('Should fail on bad names', async function () {
                handleDirectMessage('др Лохов').then(() => {
                    assert.fail('Success when error was expected')
                }).catch(() => {})
            })
        })
        describe('цитата', () => {
            it('Should work without arguments', async function () {
                assert.ok(await handleDirectMessage('цитата'))
            })
            it('Should return fixed value when called with an argument', async function () {
                assert.equal((await handleDirectMessage('цитата 1')), '```<Ares> ppdv, все юниксы очень дружелюбны.. они просто очень разборчивы в друзьях ;)```:copyright: bash.im, цитата #1')
            })
        })
    })
    describe('global', () => {
        it('Should not bother when nothing matches', async function () {
            assert.equal(await handleGlobalMessage('фывапр'), undefined)
        })
        describe('антимат', () => {
            it('Should react to sweary words', async function () {
                assert.equal(await handleGlobalMessage('ебаный мудак!', await Member.findByName('Петров')), "**НЕ МАТЕРИСЬ**")
            })
            it('Should not react to sweary words by admin', async function () {
                assert.equal(await handleGlobalMessage('ебаный мудак!', await Member.findBy('admin', true)), undefined)
            })
        })
    })
})

after(async function () {
    await global.db.query(`DROP TABLE members;`)
})