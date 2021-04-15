/* eslint-disable prettier/prettier */
import { Dirs, FileSystem } from 'react-native-file-access';
import CryptoJS from 'crypto-js';
export let app_database = {
    database: [],
    bookmarks: [],
    cache: [],
    activation: [],
    ID: null,
    get get_database() {
        return this.database;
    },
    set update_database(data) {
        if (data.is_array) {
            this.database = [...this.database, data.update];
        } else {
            this.database = data.update;
        }
    },
    set default_ID(update) {
        this.ID = update;
    },
    get get_bookmarks() {
        return this.bookmarks;
    },
    set update_bookmarks(update) {
        this.bookmarks = update;
    },
    get get_activation() {
        return this.activation;
    },
    set update_activation(update) {
        this.activation = update;
    },
    get get_cache() {
        return this.cache;
    },
    set update_cache(update) {
        this.cache = update;
    },
    async save_file(quiz) {
        try {
            let path = quiz.path;
            let encrypted = CryptoJS.AES.encrypt(JSON.stringify(quiz), 'nabeeladnanalinizam_20900!@#()').toString();
            await FileSystem.writeFile(path, encrypted);
        } catch (error) {
            return error;
        }
    },
    async save_blsm() {
        try {
            let blsm = {
                ID: this.ID,
                activation: this.activation,
                bookmarks: this.bookmarks,
                cache: this.cache,
            };
            let encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(blsm),
                'nabeeladnanalinizam_20900!@#()',
            ).toString();
            await FileSystem.writeFile(Dirs.DocumentDir + '/b.blsm', encrypted);
        } catch (error) {

        }
    },
};
