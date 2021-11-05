import React, { Fragment } from 'react'
import { ReactSession } from 'react-client-session';
import { server_ip, server_port, tile_length } from './Constants';
import TileEntity from './TileEntity';
import loading_bar from './assets/world/loading_bar_bg.png'

export default class AnimalEntity extends TileEntity {
    constructor(props) {
        super(props);
        this.imgElement = React.createRef();
        this.imgPath = "/assets/animals/" + this.props.animal + "/" + this.props.animal + "_icon.png"
        this.state = {
            ...this.state,
            animal: this.props.animal,
            lastHarvested: this.props.lastHarvested,
            animal_data: null,
            queued: this.props.queued,
            actionstate: null,
            actionprogress: 0,
        };
        // THIS IS DATA THAT SHOULD BE RETRIEVED FROM SOME API
        fetch(`/assets/animals/${this.props.animal}/${this.props.animal}_properties.json`)
            .then((r) => r.json())
            .then((data) =>{
                this.state.animal_data = data;
            });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async place() {
        const planttime = 1000; // ms
        const steptime = 10; // ms
        const stepsize = 100 / (planttime / steptime);
        for (var i = 0; i < 100; i += stepsize) {
            const copystate = {...this.state};
            copystate.actionstate = "Placing animal";
            copystate.actionprogress = i;
            this.setState(copystate);
            await this.sleep(steptime);
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                       'Authentication': `${ReactSession.get("token") }`},
            body: JSON.stringify({ x: this.props.x, y: this.props.y, animal: this.props.animal })
          };
          fetch(`http://${server_ip}:${server_port}/PlaceAnimal`, requestOptions)
                .then((r) => {
                    if (r.ok)
                    { return r.json(); }
                    else
                        {
                            window.location.reload();
                        }
                    })
                .then((respdata) =>{
                    const copystate = {...this.state};
                    copystate.lastHarvested = respdata.lastHarvested;
                    copystate.actionstate = null;
                    copystate.actionprogress = 0;
                    const data2 = this.state.animal_data;
                    const griddata = {
                        type: "Animal",
                        animal: this.state.animal,
                        lastHarvested: respdata.lastHarvested,
                        queued: false,
                    };
                    this.props.setGridData(this.props.x, this.props.y, griddata);
                    copystate.animal_data = data2;
                    this.setState(copystate);
                });
    }

    async harvest() {
        const harvesttime = 1000; // ms
        const steptime = 10; // ms
        const stepsize = 100 / (harvesttime / steptime);
        for (var i = 0; i < 100; i += stepsize) {
            const copystate = {...this.state};
            copystate.actionstate = "Harvesting";
            copystate.actionprogress = i;
            this.setState(copystate);
            await this.sleep(steptime);
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                       'Authentication': `${ReactSession.get("token") }`},
            body: JSON.stringify({ x: this.props.x, y: this.props.y })
          };
          fetch(`http://${server_ip}:${server_port}/HarvestAnimal`, requestOptions)
                .then((r) => {
                    if (r.ok)
                    { return r.json(); }
                    else
                        {
                            window.location.reload();
                        }
                    })
                .then((respdata) =>{
                    const copystate = {...this.state};
                    copystate.lastHarvested = respdata.lastHarvested;
                    copystate.actionstate = null;
                    copystate.actionprogress = 0;
                    const data2 = this.state.animal_data;
                    const griddata = {
                        type: "Animal",
                        animal: this.state.animal,
                        lastHarvested: respdata.lastHarvested,
                        queued: false,
                    };
                    this.props.setGridData(this.props.x, this.props.y, griddata);
                    this.props.addCoins(data2.harvestcoins);
                    copystate.animal_data = data2;
                    this.setState(copystate);
                });
    }

    setQueued(queued) {
        const copystate = {...this.state};
        copystate.queued = queued;
        this.setState(copystate);
    }

    render() {
        const styles = { 
            zIndex: 2,
            position: 'absolute',
            width:  this.state.renderWidth,
            height: this.state.renderHeight,
            transform: `translate(${this.state.horizontalDisplacement}px, ${this.state.verticalDisplacement}px)`,
        };
        if (this.state.queued || this.state.actionstate) {
            styles.opacity = 0.5;
        }
        let actiondiv;
        if (this.state.actionstate) {
            const action_div_styles = {
                position: 'absolute',
                height: 20,
                width: 150,
                transform: 'translate(-50px, -54px)',
                zIndex: 3,
                pointerEvents: 'none',
            };
            const inner_div_styles = {
                position: 'relative',
                pointerEvents: 'none',
            }
            const action_bg_styles = {
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none',
            };
            const action_bar_styles = {
                position: 'absolute',
                left: 1,
                top: 1,
                backgroundColor: '#42f54e',
                height: 'calc(100% - 4px)',
                width: `calc(${this.state.actionprogress}% - 4px)`,
                zIndex: 2,
                pointerEvents: 'none',
            };
            const action_text_styles = {
                position: 'absolute',
                left: 5,
                top: 5,
                color: 'white',
                fontSize: 16,
                zIndex: 3,
                pointerEvents: 'none',
            }
            actiondiv = <div style={action_div_styles}>
                <div style={inner_div_styles}>
                    <img src={loading_bar} alt="" style={action_bg_styles}></img>
                    <div style={action_bar_styles} />
                    <div style={action_text_styles}><strong>{this.state.actionstate}: {this.state.actionprogress}%</strong></div>
                </div>
            </div>
        }
        return (
            <Fragment>
                <img ref={this.imgElement} class="AnimalImg" style={styles} src={this.imgPath} alt=""
                    onClick={() => this.props.animalClick()}
                    onLoad={() => {
                        const copystate = {...this.state};
                        copystate.renderHeight = this.calcRenderHeight(this.imgElement.current.naturalHeight, this.imgElement.current.naturalWidth);
                        copystate.renderWidth = this.calcRenderWidth(this.props.width);
                        copystate.horizontalDisplacement = this.calcHorizontalDisplacement(this.props.width, copystate.renderWidth);
                        copystate.verticalDisplacement = this.calcVerticalDisplacement(copystate.renderHeight) - tile_length/2;
                        this.setState(copystate);
                    }}
                />
                {actiondiv}
            </Fragment>
        )
    }
}
