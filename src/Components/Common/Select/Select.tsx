import './Select.scss'
import { memo } from 'react'
import Select from 'react-select'
import { CustomSelectProps } from '../../../Utils/Interfaces'

const CustomSelect = ({
  className,
  menuIsOpen,
  defaultValue,
  onChange,
  options,
  name,
  isMulti,
  value,
  isClearable,
  onMenuScrollToBottom,
  placeholder,
  filterOption,
  isSearchable,
  closeMenuOnSelect,
  error,
}: CustomSelectProps) => {

  return (
    <div className="customInput_inner errorMargin ">
      <Select
        defaultValue={defaultValue}
        onChange={onChange}
        options={options}
        value={value}
        className={`common_select ${className} ${error ? 'is-invalid' : ''}`}
        classNamePrefix="select"
        menuIsOpen={menuIsOpen}
        placeholder={placeholder}
        name={name}
        isMulti={isMulti}
        isClearable={isClearable}
        onMenuScrollToBottom={onMenuScrollToBottom}
        filterOption={filterOption}
        closeMenuOnSelect={closeMenuOnSelect}
        isSearchable={isSearchable}
      />
      {error}
    </div>
  )
}

export default memo(CustomSelect)
