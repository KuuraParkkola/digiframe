import { Connection, Mode } from './connection';


class NormalMode extends Mode {
    constructor(cbChModeP, cbEditStateP) {
        super(cbChModeP, cbEditStateP);

        this.offlineMode = undefined;
        this.sleepMode = undefined;

        this.setup = this.setup.bind(this);
    };

    disconnect() {
        this.state(prev_state => ({
            ...prev_state,
            info: [ ...prev_state.info, "Offline" ]
        }));
        this.mode(this.offlineMode);
    };

    sleep() {
        this.state(prev_state => ({
            ...prev_state,
            active: false
        }));
        this.mode(this.sleepMode);
    }

    setModes()

    setup(socket) {
        this.socket = socket;

        this.socket.on('disconnect');
    };
};

class OfflineMode extends Mode {
    constructor(cbChModeP, cbEditStateP) {
        super(cbChModeP, cbEditStateP);
    };
};

class SleepMode extends Mode {
    constructor(cbChModeP, cbEditStateP) {
        super(cbChModeP, cbEditStateP);
    };
};


class SvcConnection extends Connection {
    constructor(cbEditStateP) {
        super(cbEditStateP);

        const normalMode = NormalMode(this.chMode, this.editState);
        const unstableMode = UnstableMode(this.chMode, this.editState);
        const sleepMode = SleepMode(this.chMode, this.editState);
    };
};