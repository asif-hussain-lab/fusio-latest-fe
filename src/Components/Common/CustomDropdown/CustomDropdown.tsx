import Dropdown from 'react-dropdown';
import "./CustomDropdown.scss";
import { CustomDropdownProps } from '../../../Utils/Interfaces';

const CustomDropdown = (props: CustomDropdownProps) => {
    return (
      <>
        <div className="customDropdown">
          {props?.icon && <span className="customIcon">{props?.icon}</span>}
          <Dropdown
            options={props?.options}
            onChange={props?.onSelect}
            value={props?.defaultOption}
            placeholder={props?.placeholder}
            className={props?.className}
          />
        </div>
      </>
    )
}

export default CustomDropdown
