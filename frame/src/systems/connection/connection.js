export class Mode {
    constructor(cbChModeP, cbEditStateP) {
        this.socket = undefined;
        this.chMode = cbChModeP;
        this.editState = cbEditStateP;

        this.mode = this.mode.bind(this);
        this.state = this.state.bind(this);
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
    };

    setup(socket) {
        throw new Error("Setup not implemented");
    };

    setModes() {
        throw new Error("Set modes not implemented");
    };

    mode(new_mode) {
        if (this.active) {
            try {
                this.chMode(new_mode);
            } catch (err) {
                this.activate();
            };
        };
    };

    state(new_state) {
        if (this.active) {
            this.editState(new_state);
        };
    };

    activate(socket) {
        this.socket = socket;
        this.setup(socket);
    };

    deactivate() {
        this.socket.removeAllHandlers();
    };
};

export class Connection {
    constructor(cbEditStateP) {
        this.socket = undefined;
        this.connected = false;
        this.mode = undefined;
        this.editState = cbEditStateP;

        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    };

    chMode(new_mode) {
        try {
            old_mode = this.mode();
            old_mode.deactivate();
            new_mode.activate();
            this.mode = new_mode;
        } catch (err) {
            console.error("Mode swap failed, falling back");
        };
    };

    connect() {
        throw new Error("Connect not implemented");
    };

    disconnect() {
        throw new Error("Disconnect not implemented");
    };
};