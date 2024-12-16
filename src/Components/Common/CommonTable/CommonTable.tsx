import { useState } from 'react'
import { Table } from 'react-bootstrap'
import { SortIcon } from '../../../Assets/Images/Icons/SvgIcons'
import { CommonTableProps } from '../../../Utils/Interfaces'
import NoRecord from '../NoRecord/NoRecord'
import ShimmerTable from '../Shimmer/ShimmerTable'
import './CommonTable.scss'

const CommonTable = ({ className, fields, sortbuttons, children, noRecordFound, loading }: CommonTableProps) => {
  const [active, setActive] = useState(false)
  return (
    <div className="tableless">
      <Table responsive className={`common_table mb-0 ${className}`}>
        {fields && (
          <thead>
            <tr>
              {fields?.map((item:any) => (
                <th key={item}>
                  <div className="d-flex align-itmes-center">
                    {item}
                    {sortbuttons && (
                      <span
                        onClick={() => setActive(!active)}
                        className={`sort_icon ${active ? 'up_active' : 'down_active'}`}
                      >
                        <SortIcon />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        {!loading ? (
          <tbody>
            {children?.length ? (
              children
            ) : (
              <tr className="no_record text-center">
                <td colSpan={fields?.length}>{noRecordFound || <NoRecord loading={loading} shimmerType='table'/>}</td>
              </tr>
            )}
          </tbody>
        ) : (
          ''
        )}
        {loading ? (
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <ShimmerTable key={i} fields={fields}/>
            ))}
          </tbody>
        ) : (
          ''
        )}
      </Table>
    </div>
  )
}

export default CommonTable
