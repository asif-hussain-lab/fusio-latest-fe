import { SearchIcon } from '../../../Assets/svgImgs/svgImgs'
import { CommonSearchProps } from '../../../Utils/Interfaces'
import "./CommonSearch.scss"

const CommonSearch = (props: CommonSearchProps) => {
    return (
      <>
        {props?.label && (
          <label className="form-label" htmlFor="search">
            {props?.label}
          </label>
        )}
        <div className={`commonSearch ${props?.className}`}>
          <span className="searchIcon">
            <SearchIcon />
          </span>
          <input
            type="text"
            name={props?.name}
            placeholder={props?.placeholder}
            className="from-control"
            onChange={props?.onChange}
            maxLength={props?.maxLength}
          />
        </div>
      </>
    )
}

export default CommonSearch
