import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileSystem } from 'react-native-file-access';
import CryptoJS from 'crypto-js';

let database = []
let bookmarks = []
let act_array = []
let error_array = []
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
    return act_array
}
function is_quiz_valid(code) {
    if ([...new Set(act_array)].filter(i => i.code == code)[0].valid) return true
    return false
}
async function update_act(data) {
    act_array = data;
    try {
        const jsonValue = JSON.stringify(act_array)
        await AsyncStorage.setItem('@act_array', CryptoJS.AES.encrypt(jsonValue, 'nabeeladnanalinizam_20900!@#()').toString())
    } catch (e) {
    }
}
async function save_file(quiz) {
    let path = quiz.path;
    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
    await FileSystem.writeFile(path, encrypted)
}
function get_error_msgs() {
    return error_array;
}
function update_error_msgs(data) {
    error_array.push(data)
}
export { get_database, update_database, get_bookmarks, update_bookmarks, get_act, update_act, save_file, is_quiz_valid, get_error_msgs, update_error_msgs }