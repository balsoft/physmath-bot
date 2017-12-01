/**
 * @class
 */
class Member {
    /**
     * Создать нового члена класса или получить из базы данных существующего
     * @param {string} name Имя человека
     * @param {Date} birthdate Дата рождения (только при создании)
     * @param {{}} extra Характеристики человека (только при создании)
     */
    constructor(name, birthdate, extra) {
        this.name = name
        this.birthdate = birthdate
        this._extra = extra || {}
        global.db.query(`INSERT INTO members VALUES ($1, $2, $3)`, [this.name, this.birthdate, JSON.stringify(this._extra)]).catch(() => {
            global.db.query(`UPDATE members SET birthdate=$2, extra=$3 WHERE name=$1`, [this.name, this.birthdate, JSON.stringify(this._extra)])
        })
    }
    get extra() {
        return this._extra
    }
    set extra(val) {
        this._extra = val
        this.push()
    }
    /**
     * Найти человека по имени
     * @param {string} name
     */
    static async findByName(name) {
        const result = await global.db.query(`SELECT * FROM members WHERE name LIKE '%${name}%'`)
        if (result.rowCount == 1) {
            return new Member(result.rows[0].name, result.rows[0].birthdate, result.rows[0].extra)
        } else {
            throw "Нет такого человека"
        }
    }
    /**
     * Найти человека по дате рождения
     * @param {Date} birthdate 
     */
    static async findByBirthdate(birthdate) {
        const result = await global.db.query(`SELECT * FROM members WHERE birthdate=$1`, [birthdate])
        if (result.rowCount == 1) {
            return new Member(result.rows[0].name, result.rows[0].birthdate, result.rows[0].extra)
        } else {
            throw "Нет такого человека"
        }
    }
    /**
     * Найти человека по дополнительной характеристике
     * @param {string} by Характеристика поиска
     * @param {string} like Искомое значение 
     */
    static async findBy(by, like) {
        const members = await Member.getAll()
        var member = members.find((value) => {
            return value.extra && (value.extra[by] == like)
        })
        if (!member) {
            throw "Нет такого человека"
        } else
            return member
    }
    /**
     * Все члены класса
     */
    static async getAll() {
        var members = []
        const result = await global.db.query(`SELECT * FROM members`)
        for (var row in result.rows) {
            members.push(new Member(result.rows[row].name, result.rows[row].birthdate, result.rows[row].extra))
        }
        return members
    }
    /**
     * Записать человека в базу данных
     */
    async push() {
        try {
            await global.db.query(`INSERT INTO members VALUES ($1, $2, $3)`, [this.name, this.birthdate, JSON.stringify(this.extra)])
        } catch (err) {
            await global.db.query(`UPDATE members SET birthdate=$2, extra=$3 WHERE name=$1`, [this.name, this.birthdate, JSON.stringify(this.extra)])
        }
    }
}
module.exports = {
    Member
}