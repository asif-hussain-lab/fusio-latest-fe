import { memo } from 'react'
import Marquee from 'react-fast-marquee'

const MarqueeComponent = ({text}: {text:string}) => {
  return (
    <Marquee>
      <h4 className="text-warning words mb-5 mx-5 marquee-text">{text}</h4>
    </Marquee>
  )
}

export default memo(MarqueeComponent)
