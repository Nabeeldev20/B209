import { Dirs, FileSystem } from 'react-native-file-access';
import CryptoJS from 'crypto-js';

let database = []
let bookmarks = []
let act_array = []
let error_array = []
let cache_array = []
let mac = null
function update_mac(update) {
    mac = update
}
function get_mac() {
    return mac
}
function get_database() {
    return database
}
function update_database(update) {
    database = [...database, update]
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
function erase_bookmarks() {
    bookmarks = []
}
function get_act() {
    return act_array
}
function get_cache_array() {
    return cache_array
}
function update_cache_array(update) {
    cache_array.push(...update)
}
function update_act(update) {
    act_array.push(...update);
}
async function save_file(quiz) {
    try {
        let path = quiz.path;
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
        await FileSystem.writeFile(path, encrypted);
    } catch (error) {
        update_error_msgs({ Code: 'error writing to file', error })
    }
}
async function save_blsm() {
    try {
        let blsm = {
            mac,
            act_array,
            bookmarks,
            cache_array
        }
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(blsm), 'nabeeladnanalinizam_20900!@#()').toString();
        await FileSystem.writeFile(Dirs.DocumentDir + '/b.blsm', encrypted);
    } catch (error) {
        update_error_msgs({ Code: 'Error saving blsm ' + error })
    }
}
function get_error_msgs() {
    return error_array;
}
function update_error_msgs(data) {
    error_array.push(data)
}
export {
    get_database,
    update_database,
    get_mac,
    update_mac,
    get_bookmarks,
    erase_database,
    update_bookmarks,
    erase_bookmarks,
    get_act,
    update_act,
    save_file,
    get_error_msgs,
    update_error_msgs,
    get_cache_array,
    update_cache_array,
    save_blsm
}