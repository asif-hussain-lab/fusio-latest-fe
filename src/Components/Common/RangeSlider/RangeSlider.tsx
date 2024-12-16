import 'react-rangeslider/lib/index.css'
import Slider from 'react-rangeslider'
import './RangeSlider.scss'

const RangeSlider = ({ min, max, step, value, onChange }) => {
 
  const horizontalLabels = {
    0: '0%',
    100: '100%'
  }
  const formatPc = (p) => p + '%'
  const handleChange = (newValue) => {
    onChange(newValue)
  }

  return (
    <div className="slider custom-labels">
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        format={formatPc}
        labels={horizontalLabels}
        onChange={handleChange}
      />
    </div>
  )
}

export default RangeSlider
