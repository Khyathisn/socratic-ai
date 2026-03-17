'use client'

import { useEffect, useRef } from "react"
import NET from "vanta/dist/vanta.net.min"
import * as THREE from "three"

export default function ConstellationBackground(){

  const ref = useRef(null)

  useEffect(()=>{

    let effect:any

    if(ref.current){

      effect = NET({

        el: ref.current,

        THREE: THREE,

        color: 0x7fffffff,

        backgroundColor: 0x080808,

        points: 10,

        maxDistance: 22,

        spacing: 18,

        speed: 0.7

      })

    }

    return () => {
      if(effect) effect.destroy()
    }

  },[])

  return(

    <div
      ref={ref}
      style={{
        position:"fixed",
        top:0,
        left:0,
        width:"100%",
        height:"100%",
        zIndex:0,
        opacity: 0.01,
        filter: "blur(1px)"
      }}
    />

  )

}
