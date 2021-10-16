import React from 'react'
import Tool from './Tool';
import img from '../../assets/menu/tools_recycle.png'
import bg from '../../assets/menu/tool_button.png'

export default class Recycle extends Tool {
    render() {
        return (
            <div style={this.div_styles}>
                <img src={bg} style={this.styles} alt=""/>
                <img src={img} style={this.img_styles} alt=""/>
            </div>
        )
    }
}
