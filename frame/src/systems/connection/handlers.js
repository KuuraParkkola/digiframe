/**
 * Special events
 */
const handle = {
    poweroff: (socket, poweroff) => () => {
        console.log("Would poweroff");
    },
    
    service: (socket, setState) => (time, message) => {
        console.log(`Would drop connection for ${time}s` + (message ? `: ${message}` : ''));
    },
    
    reload: () => () => {
        console.log("Would reload");
    },
    
    /**
     * State change events
     */
    reconnect: (socket, setState) => () => {
        socket.removeAllHandlers('connect');
        setState(prev_state => ({
            ...prev_state,
            info: prev_state.info.filter(element => element != "Offline")
        }));
    },
    
    suddenDisconnect: (notify) => () => {
        notify()
    },
    
    sleep: (socket, setState) => () => {
        socket.removeAllHandlers('sleep');
        socket.on('wake', this.wake(socket, setState));
        setState(prev_state => ({
            ...prev_state,
            active: false
        }));
    },
    
    wake: (socket, setState) => () => {
        socket.removeAllHandlers('wake');
        socket.off('wake', wake);
        socket.on('sleep', sleep);
        setState(prev_state => ({
            ...prev_state,
            active: true
        }));
    },
    
    /**
     * Data change events
     */
    album_add: (setState) => img => {
        console.log("Would add image", img);
    },

    album_drop: (setState) => img => {
        console.log("Would drop image", img, "... but won't");
    },

    album_set: (setState) => album => {
        setState(prev_state => ({
            ...prev_state,
            album: album
        }));
    },

    settings_set: (setState) => settings => {
        setState(prev_state => ({
            ...prev_state,
            settings
        }));
    },
}

export default handle;