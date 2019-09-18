import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      glb: false,
      frm: false
    };
  };

  render() {
    return (
      <div className="App">
        <div className="Sidenav">
          <div className="Brand">
            <h1>Frame</h1>
          </div>
          <div className="Navigation">
            <div className={"Btn"}>
              <h1 className="BtnTitle">Global</h1>
            </div>
            <div className={"Btn"} style={{height: this.state.frm ? 4 * 50 + 'px' : '50px',
                                           transition: "height 0.25s"}}>
              <h1 className="BtnTitle">Frames</h1>
              <div className="BtnSlideContent">
                <p>[Placeholder]</p>
                <p>[Placeholder]</p>
                <p>[Placeholder]</p>
              </div>
            </div>
          </div>
        </div>
        <div className="Display">
          <div className="Alerts">
            <h1>Alert</h1>
          </div>
          <h1>content</h1>
        </div>
      </div>
    )
  }
}

