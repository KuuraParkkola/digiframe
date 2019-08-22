import React from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';

import { NotImplemented, Timeout, ConnectionError, NotConnected } from './utilities/errors';
import { NoSvcConnection, NoHwConnection, AlbumNotLoaded, NotSetUp } from './utilities/problems';
import { sleep } from './utilities/tools';

import Display from './components/Display';

class App extends React.Component {
  constructor(props){
    super(props);

    this.svcSocket = undefined;

    this.frame_id = null;
    this.token = undefined;

    this.hw_conn = false;
    this.svc_conn = false;

    this.state = {
      active: true,
      notifications: [],
      album: [],
      interval: 60,
      aspect: 0
    };

    this.notify = this.notify.bind(this);
    this.dismiss = this.dismiss.bind(this);

    this.connectService = this.connectService.bind(this);
    this.setSvcHandlers = this.setSvcHandlers.bind(this);
  };

  notify(notification) {
    this.setState(prev_state => {
      if (prev_state.notifications.some(element => element == notification)) {
        return prev_state;
      } else {
        return {
          ...prev_state,
          notifications: [...prev_state.notifications, notification]
        };
      };
    });
  };

  dismiss(notification) {
    this.setState(prev_state => ({
      ...prev_state,
      notifications: prev_state.notifications.filter(element => element != notification)
    }));
  };

  setSvcHandlers(){
    this.svcSocket.on('disconnect', () => {
      this.notify(NoSvcConnection);
    });
    this.svcSocket.on('connect', () => {
      this.dismiss(NoSvcConnection);
    });
    this.svcSocket.on('service', (time, msg) => {
      console.log(`Would init service break of ${time}s`);
    });
    this.svcSocket.on('reload', () => {
      console.log("Would power off");
    });
    this.svcSocket.on('reload', () => {
      console.log("Would load latest sw revision");
    });
    this.svcSocket.on('sleep', () => {
      this.setState(prev_state => ({
        ...prev_state,
        active: false
      }));
    });
    this.svcSocket.on('wake', () => {
      this.setState(prev_state => ({
        ...prev_state,
        active: true
      }));
    });
    this.svcSocket.on('album_add', (img, ack) => {
      console.log("Would add image", img);
      ack();
    });
    this.svcSocket.on('album_drop', (img, ack) => {
      console.log("Would drop image", img, "... but won't");
      ack();
    });
    this.svcSocket.on('album_set', (album, ack) => {
      this.setState(prev_state => ({
        ...prev_state,
        album: album
      }));
      ack();
    });
    this.svcSocket.on('settings_set', (settings, ack) => {
      console.log("Settings");
      this.setState(prev_state => ({
        ...prev_state,
        ...settings
      }));
      ack();
    });
  };

  /**
   * Initiates a connection with a daemon process running locally.
   * 
   * Creates and tries to connect a socket and handles handshake
   * with the other end.  
   */
  async connectHardware() {
    this.notify(NoHwConnection);
  };

  /**
   * Initiates a connection with the server hosting the monitor.
   * 
   * Creates and tries to connect a socket and handles handshake
   * with the other end.  
   */
  async connectService() {
    this.svcSocket = socketIOClient('/frame');

    try {
      await new Promise((resolve, reject) => {

        this.svcSocket.on('connect', () => {
          resolve();
        });

        this.svcSocket.on('connect_timeout', () => {
          reject(new Error(Timeout));
        });
      });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.svcSocket.emit('connect_abort');
          this.svcSocket.disconnect(true);
          reject(new Error(Timeout));
        }, 5000);

        this.svcSocket.emit("identify", {
          name: this.frame_id
        }, token => {
          clearTimeout(timeout);
          this.token = token;
          resolve();
        });
      });

      // Clean up connection handlers
      // then set running handlers
      this.svcSocket.removeAllListeners();
      this.setSvcHandlers();

      this.dismiss(NoSvcConnection);
      this.svcSocket.emit('ready');

      return;

    } catch (err) {
      this.svcSocket.removeAllListeners();
      this.svcSocket.disconnect(true);
      this.notify(NoSvcConnection);
      throw new Error(NotConnected);
    };
  };

  async componentDidMount () {
    /**
     * Hardware connection
     */
    try {
      await this.connectHardware();
    } catch (err) {
      console.error("Unhandled error:", err);
    };

    /**
     * Service connection
     */
    try {
      await this.connectService();
    } catch (err) {
      console.error("Unhandled error:", err);
    };

    const set_dimensions = () => {
      this.setState(prev_state => ({
        ...prev_state,
        aspect: window.innerWidth / window.innerHeight
      }));
    };

    window.addEventListener("resize", set_dimensions);
    set_dimensions();
  };

  render(){
    return (
      <div className="App">
        <Display interval={this.state.interval}
                 notifications={this.state.notifications}
                 album={this.state.album}
                 active={this.state.active}
                 aspect={this.state.aspect}/>
      </div>
    );
  } 
}

export default App;
