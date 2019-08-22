import React from 'react'

export default function Img(props) {
    const orientation = props.aspect > (props.image.width / props.image.height) ? "Tall" : "Wide";
    return (
        <img className={ orientation + " Img" } src={props.image.data} alt="" />
    )
}
