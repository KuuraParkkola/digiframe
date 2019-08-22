import React, { Component } from 'react';

import Img from './Img';
import Image from './Image';
import Info from './Info';

export default class Display extends Component {
    constructor(props){
        super(props);
        this.state = {
            img_idx: 0,
            nfo_idx: 0
        }
        this.img_interval = -1;
        this.img_tick = undefined;
        this.info_tick = undefined;
    };

    componentDidMount(){
        this.info_tick = setInterval(() => {
            this.setState(prev => {
                return {
                    ...prev,
                    nfo_idx: (prev.nfo_idx + 1) % this.props.notifications.length || 0
                }
            });
        }, 3000);

        this.img_tick = setInterval(() => {
            this.setState(prev => {
                return {
                    ...prev,
                    img_idx: (prev.img_idx + 1) % this.props.album.length || 0
                }
            });
        }, this.props.interval * 1000);
        this.img_interval = this.props.interval;
    };

    componentDidUpdate(){
        if (this.props.interval !== this.img_interval){
            clearInterval(this.img_tick);
            this.img_tick = setInterval(() => {
                this.setState(prev => {
                    return {
                        ...prev,
                        img_idx: (prev.img_idx + 1) % this.props.album.length || 0
                    }
                });
            }, this.props.interval * 1000);
            this.img_interval = this.props.interval;
        }
    }

    componentWillUnmount(){
        clearInterval(this.img_tick);
        clearInterval(this.info_tick);
    }

    render() {
        if (this.props.album.length > 0) console.log(this.props.album[this.state.img_idx].html || null);
        return (
            <div className={ "Display " + (this.props.active ? "Active" : "Standby") }>
                { (this.props.notifications.length > 0) && this.props.active ?
                    <Info content={this.props.notifications[this.state.nfo_idx]} />
                    : null }
                { (this.props.album.length > 0) && this.props.active ?
                    <Image>
                        <Img image={this.props.album[this.state.img_idx]} aspect={this.props.aspect} />
                    </Image>
                    : null }
            </div>
        )
    };
}
