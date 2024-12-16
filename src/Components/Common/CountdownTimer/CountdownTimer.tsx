import { useEffect, useState } from 'react'
import { zeroPad } from 'react-countdown'

const CountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  function calculateTimeRemaining() {
    const now: any = new Date()
    const targetTime: any = new Date(now)
    targetTime.setUTCHours(5, 0, 0, 0)

    if (now.getUTCHours() >= 5) {
      targetTime.setUTCDate(targetTime.getUTCDate() + 1)
    }

    const difference = targetTime - now
    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  return (
    <div>
      <h6 className='yellow_text'>{`${zeroPad(timeRemaining.hours)} hrs : ${zeroPad(timeRemaining.minutes)} min : ${zeroPad(
        timeRemaining.seconds
      )} sec`}</h6>
    </div>
  )
}

export default CountdownTimer
