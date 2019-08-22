const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const knex = require('./db');
const sizeOf = promisify(require('image-size'));
const readdir = promisify(fs.readdir);
const readfl = promisify(fs.readFile);


class _Album {
    constructor(base_path, album){
        this.base_path = base_path;
        this.name = album;
        this.album = undefined;
        this.subscribers = [];

        this.index = this.index.bind(this);
        this.loadAlbum = this.loadAlbum.bind(this);
        this.loadFile = this.loadFile.bind(this),
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);

        this.loadAlbum(base_path, album);
    };

    index(objects) {
        let unindexed = new Array();
        let indices = new Set();

        objects.forEach(element => {
            if (element.index == -1) unindexed.push(element);
            else indices.add(element.index);
        });

        unindexed = unindexed[Symbol.iterator]();

        let index = 0;
        let element = unindexed.next();
        while (!element.done) {
            if (!indices.has(index)) {
                element.value.index = index;
                indices.add(index);
                element = unindexed.next();
            };
            index++;
        };

        return objects;
    };

    async reindexDatabase(album, objects) {
        const old = await knex('images').select().where('album', album);
        objects.forEach(async element => {
            old.forEach(async old_element => {
                if (element.title == old_element.title && element.index != old_element.index){
                    await knex('images').update({index: element.index}).where('id', old_element.id);
                };
            });
        });
    };

    async loadAlbum () {
        const content = await Promise.all((await readdir(path.join(this.base_path, this.name))).map(this.loadFile));

        this.index(content);
        this.reindexDatabase(this.name, content);

        this.album = content.reduce((target, element) => {
            target[element.title] = element;
            return target;
        }, {});
    };

    async loadFile(filename) {
        const statPromise = new Promise(async (resolve, reject) => {
            let existing = await knex('images').first().where('path', path.join(this.base_path, this.name, filename));
            if (!existing) {
                const stat = await sizeOf(path.join(this.base_path, this.name, filename));
                existing = {
                    title: path.basename(filename),
                    album: this.name,
                    path: path.join(this.base_path, this.name, filename),
                    index: -1,
                    height: stat.height,
                    width: stat.width,
                    type: `image/${stat.type}`,
                };
                await knex('images').insert(existing);
            };
            resolve((({ title, index, height, width, type }) => ({ title, index, height, width, type }))(existing));
        });

        const dataPromise = new Promise((resolve, reject) => {
            fs.readFile(path.join(this.base_path, this.name, filename), (err, data) => {
                if (err) reject(err);
                else resolve(data.toString('base64'));
            });
        });

        const stat = await statPromise;
        const data = await dataPromise;

        return {
            ...stat,
            data: 'data:' + stat.type + ';base64,' + data,
        };
    };

    subscribe(subscriber) {
        if (!this.subscribers.includes(subscriber)) {
            this.subscribers.push(subscriber);
            subscriber.notify('album', Object.values(this.album));
        };
    };

    unsubscribe(subscriber) {
        this.subscribers = this.subscribers.filter(element => element !== subscriber);
    };
};

class _AlbumManager {
    constructor(base_dir) {
        this.albums = undefined;

        this.loadLibrary(base_dir);
    };

    async loadLibrary(base_dir) {
        const albums = await Promise.all((await readdir(base_dir)).map(element => new _Album(base_dir, element)));
        this.albums = albums.reduce((target, obj) => {
            target[obj.name] = obj;
            return target;
        }, {});
    };

    subscribe(album, subscriber) {
        console.log("new sub");
        if (this.albums.hasOwnProperty(album)) {
            this.albums[album].subscribe(subscriber);
        } else {
            throw new Error("No such album");
        };
    };

    unsubscribe(album, subscriber) {
        if (this.albums.hasOwnProperty(album)) {
            this.albums[album].unsubscribe(subscriber);
        } else {
            throw new Error("No such album");
        };
    };
};

const AlbumManager = (() => {
    let instance;
 
    return {
        getInstance: () => {
            if (!instance) {
                throw(new Error('Not instantiated'));
            };
            return instance;
        },

        makeInstance: library => {
            if (!instance) {
                instance = new _AlbumManager(library);
                return instance;
            } else {
                throw(new Error('Already instanciated'));
            };
        }
    };
})();

module.exports = AlbumManager;