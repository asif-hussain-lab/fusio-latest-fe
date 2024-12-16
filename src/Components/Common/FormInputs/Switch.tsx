import { Form } from 'react-bootstrap'
import { SwitchProps } from '../../../Utils/Interfaces'


const Switch = (props: SwitchProps) => {
  return (
    <>
      <Form.Group className={`${props?.className} checkbox_input`} controlId={props.id}>
        <Form.Check
          className="form-check"
          disabled={props?.disabled}
          type="switch"
          id={props?.id}
          label={props?.label}
          name={props?.name}
          onChange={props?.onChange}
          value={props?.value}
          checked={props?.checked}
        />
      </Form.Group>
    </>
  )
}

export default Switch
