const albums = require('./albums').getInstance();

class _Frame {
    constructor(socket, identity, ack) {
        this.socket = socket;
        this.name = identity.name;
        this.token = identity.token;
        this.ready = false;
        this.connected = true;
        this.album = 'dev';

        this.socket.on('ready', async () => {
            this.ready = true;
            await this.setSettings({interval: 7});
            albums.subscribe(this.album, this);
            console.log("Conn");
        });

        ack(this.token);

        this.socket.on('disconnect', () => this.connected = false);
        this.socket.on('connect', () => this.connected = true);

        this.setSettings = this.setSettings.bind(this);
        this.setAlbum = this.setAlbum.bind(this);
        this.queueDelete = this.queueDelete.bind(this);
    };

    notify(type, payload) {
        switch (type){
            case 'album':
                this.socket.emit('album_set', payload, () => console.log('done'));
                break;
            case 'insert':
                console.log('insert');
                break;
            case 'drop':
                console.log('drop');
                break;
            default:
                console.log('woobs');
                break;
        }
    };

    setSettings(settings) {
        new Promise(resolve =>
            this.socket.emit('settings_set', settings, () => resolve())
        );
    };

    setAlbum(album) {
        new Promise(resolve =>
            this.socket.emit('album_set', album, () => resolve())
        );
    }

    queueDelete() {
        FrameManager.markForDelete(this.name);
    };
};

class _FrameManager {
    constructor() {
        this.frames = {};

        this.openFrame = this.openFrame.bind(this);
    };

    openFrame(socket) {
        this.frames[name] = new _Frame()
    };

    onConnect(socket) {
        console.log("new_connection");

        socket.once("identify", (identity, respond) => {
            console.log("authenticate here");
            new _Frame(socket, identity, respond);
        });
    };
};

const FrameManager = (() => {
    let instance;
 
    return {
        getInstance: () => {
            if (!instance) {
                throw(new Error('Not instantiated'));
            };
            return instance;
        },

        makeInstance: () => {
            if (!instance) {
                instance = new _FrameManager();
                return instance;
            } else {
                throw(new Error('Already instanciated'));
            };
        }
    };
})();

module.exports = FrameManager;