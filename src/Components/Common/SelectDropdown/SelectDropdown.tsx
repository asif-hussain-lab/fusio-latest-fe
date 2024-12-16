import { Dispatch, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { SearchIcon } from '../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { SelectDropdownProps } from '../../../Utils/Interfaces'
import toaster from '../../Common/Toast'
import CustomSelect from '../Select/Select'
import './Select.scss'
const SelectDropdown = (props: SelectDropdownProps) => {
  const [options, setOptions] = useState<any>([])
  const dispatch: Dispatch<any> = useDispatch()

  useEffect(() => {
    getPortfolioList()
  }, [])

  const getPortfolioList = async () => {
    try {
      !props?.isMulti && props?.loader(true)
      if (!props?.portfolioList?.length) {
        let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_NAMES', {}, false))
        if (result?.success) {
          fetchOptions(result?.data)
        }
      } else {
        fetchOptions(props?.portfolioList)
      }
      !props?.isMulti && props?.loader(false)
    } catch (error) {
      console.error('Error occurred in getPortfolioList:', error)
    }
  }

  const fetchOptions = async (data: any) => {
    try {
      const options: any = data.map((item) => {
        item.investAmount = ''
        return {
          value: item,
          label: item?.portfolioName,
        }
      })
      setOptions(options)
      !props?.isMulti && props?.callback(options[0])
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleChange = async (data: any) => {
    try {
      if (data?.length <= 7) {
        const selectedIds = new Set(data.map((option) => option?.value?.portfolioId))
        options.forEach((option) => {
          if (!selectedIds.has(option?.value?.portfolioId)) {
            option.value.investAmount = ''
          }
        })
        props.callback(data)
      } else {
        toaster.error('You can select up 7 Portofolios')
      }
    } catch (error) {
      console.error('Error:', error);
    }

  }

  return (
    <CustomSelect
      className={`input_select ${props.className}`}
      options={options}
      value={props?.data}
      placeholder={
        <span className="selectSearchicon">
          <SearchIcon /> &nbsp;Search Portfolio Name
        </span>
      }
      name={props?.name}
      menuIsOpen={props.menuIsOpen}
      onChange={(selectedOption) => {
        props?.isMulti ? handleChange(selectedOption) : props.callback(selectedOption)
      }}
      isMulti={props?.isMulti}
      error={props?.error}
      closeMenuOnSelect={props?.closeMenuOnSelect}
    />
  )
}

export default SelectDropdown
