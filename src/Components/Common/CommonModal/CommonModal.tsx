import { Modal } from 'react-bootstrap'
import { CrossIcon } from '../../../Assets/svgImgs/svgImgs'
import "./CommonModal.scss"
import { CommonModalsProps } from '../../../Utils/Interfaces'

const CommonModal = (props: CommonModalsProps) => {
  return (
      <Modal
        show={props.show}
        onHide={props.handleClose}
        centered
        backdropClassName={props.backdropClassName}
        backdrop={props?.backdrop}
        className={`${props.className} ${props.variant} commonModal`}
      >
        {props.heading && (
          <Modal.Header>
            <Modal.Title>
              <h4>{props.heading}</h4>
              {props?.msg && <h6 className='text-danger'>{props?.msg}</h6>}
            </Modal.Title>
            <button onClick={props.handleClose} className="modal_close_btn">
              <CrossIcon />
            </button>
          </Modal.Header>
        )}
        <Modal.Body>{props?.children}</Modal.Body>
      </Modal>
  )
}

export default CommonModal
