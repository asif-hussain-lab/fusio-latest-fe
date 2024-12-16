import { Modal } from 'react-bootstrap'
import './CommonModal.scss'
import { CommonModalsProps } from '../../../Utils/Interfaces'

const DisclaimerModal = (props: CommonModalsProps) => {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      centered
      backdropClassName={props.backdropClassName}
      backdrop="static"
      keyboard={false}
      className={`${props.className} ${props.variant} commonModal`}
    >
      {props.heading && (
        <Modal.Header>
          <Modal.Title>
            <h4>{props.heading}</h4>
            <p>Before you proceed, please confirm <br /> the following:</p>
          </Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{props?.children}</Modal.Body>
    </Modal>
  )
}

export default DisclaimerModal
