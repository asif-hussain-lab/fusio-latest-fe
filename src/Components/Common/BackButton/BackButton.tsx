import { useNavigate } from 'react-router-dom'
import { BackArrowwhiteIcon } from '../../../Assets/svgImgs/svgImgs'
import './BackButton.scss'

const BackButton = ({className }: {className?:string}) => {
  const navigate = useNavigate()
  return (
    <div className={`backbtn ${className}`}>
      <button onClick={() => navigate(-1)}>
        <BackArrowwhiteIcon /> Back
      </button>
    </div>
  )
}

export default BackButton
