import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileSystem } from 'react-native-file-access';
import CryptoJS from 'crypto-js';

let database = []
let bookmarks = []
let act = []
function get_database() {
    return database
}
function update_database(update) {
    database = update
}

function get_bookmarks() {
    return bookmarks
}
async function update_bookmarks(update) {
    bookmarks = update;
    try {
        const jsonValue = JSON.stringify(bookmarks)
        await AsyncStorage.setItem('@bookmarks', CryptoJS.AES.encrypt(jsonValue, 'nabeeladnanalinizam_20900!@#()').toString())
    } catch (e) {
    }
}

function get_act() {
    return act
}
function is_quiz_valid(code) {
    if ([...new Set(act)].filter(i => i.code == code)[0].valid) return true
    return false
}
async function update_act(data) {
    act = data;
    try {
        const jsonValue = JSON.stringify(act)
        await AsyncStorage.setItem('@act', CryptoJS.AES.encrypt(jsonValue, 'nabeeladnanalinizam_20900!@#()').toString())
    } catch (e) {
    }
}
async function save_file(quiz) {
    let path = quiz.path;
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
    await FileSystem.writeFile(path, encrypted)
}

export { get_database, update_database, get_bookmarks, update_bookmarks, get_act, update_act, save_file, is_quiz_valid }