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
    database.unshift(update)
}
function erase_database() {
    database = []
}
function get_bookmarks() {
    return bookmarks
}
function update_bookmarks(update) {
    bookmarks.push(...update);
}

function get_act() {
    return act_array
}
function is_quiz_valid(code) {
    if ([...new Set(act_array)].filter(i => i.code == code)[0].valid) return true
    return false
}
function update_act(data) {
    act_array.push(...data);
}
async function save_file(quiz) {
    try {
        let path = quiz.path;
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
        await FileSystem.writeFile(path, encrypted);
    } catch (error) {

    }
}
function get_error_msgs() {
    return error_array;
}
function update_error_msgs(data) {
    error_array.push(data)
}
export { get_database, update_database, get_bookmarks, update_bookmarks, get_act, update_act, save_file, is_quiz_valid, get_error_msgs, update_error_msgs, erase_database }