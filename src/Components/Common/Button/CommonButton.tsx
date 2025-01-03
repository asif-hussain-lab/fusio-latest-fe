import { useSelector } from 'react-redux'
import './CommonButton.scss'
import Spinner from 'react-bootstrap/Spinner'
import { CommonButtonProps } from '../../../Utils/Interfaces'

/**COMMON BUTTON WITH DYNAMIC PROPS */
const CommonButton = (props: CommonButtonProps) => {
  const loadingStates = useSelector((state: any) => state.loader.buttonLoaderDetails)

  return (
    <button
      onClick={props?.onClick}
      type={props?.type}
      className={`btn-style ${props?.className} ${props?.fluid ? 'w-100' : ''} ${
        props?.transparent ? 'transparent' : ''
      } ${loadingStates[props?.buttonLoader] ? 'not-allowed' : ''}`}
      disabled={props?.disabled}
    >
      {props?.onlyIcon && <span className="iconSpace">{props?.onlyIcon}</span>}
      {loadingStates[props?.buttonLoader] ? 'Processing...' : props?.title}
      {loadingStates[props?.buttonLoader] ? (
        <Spinner as="span" animation="border" role="status" aria-hidden="true" />
      ) : (
        ''
      )}

      {props.btnIcon && <img src={props?.btnIcon} alt="icon" className="" />}
    </button>
  )
}

export default CommonButton
