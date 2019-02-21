import Spell from "../models/spell.js";

function formatUrl(url) {
    return '//bcw-getter.herokuapp.com/?url=' + encodeURIComponent(url)
}
// @ts-ignore
let _spellApi = axios.create({
    baseURL: ''
})

// @ts-ignore
let _sandbox = axios.create({
    baseURL: 'https://bcw-sandbox.herokuapp.com/api/Jamie/spells/'
})

let _state = {
    spellsApi: [],
    activeSpell: {},
    mySpellBook: []
}

let _subscribers = {
    spellsApi: [],
    activeSpell: [],
    mySpellBook: []
}

function setState(prop, data) {
    _state[prop] = data
    _subscribers[prop].forEach(fn => fn())
}

export default class SpellService {
    addSubscriber(prop, fn) {
        _subscribers[prop].push(fn)
    }

    get SpellsApi() {
        return _state.spellsApi.map(s => new Spell(s))
    }

    get ActiveSpell() {
        return _state.activeSpell
    }

    get MySpellBook() {
        return _state.mySpellBook.map(s => new Spell(s))
    }

    getSpellData() {
        _spellApi.get(formatUrl('http://dnd5eapi.co/api/spells/'))
            .then(res => {
                setState('spellsApi', res.data.results)
            })
    }

    getDetails(url) {
        _spellApi.get(formatUrl(url))
            .then(res => {
                let data = new Spell(res.data)
                setState('activeSpell', data)
            })
    }

    showDetails(id) {
        let spell = _state.mySpellBook.find(s => s._id == id)
        setState('activeSpell', spell)
    }

    getMySpellBook() {
        _sandbox.get()
            .then(res => {
                let data = res.data.data.map(s => new Spell(s))
                setState('mySpellBook', data)
            })
    }

    addSpell() {
        let spell = _state.mySpellBook
        if (spell) {
            _sandbox.post('', spell)
                .then(res => {
                    this.getMySpellBook()
                })
                .catch(err => {
                    console.error(err)
                })
        }
        //send data to server
        _subscribers.mySpellBook.forEach(fn => fn())

    }
}
