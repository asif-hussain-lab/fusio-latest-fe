import { Link } from 'react-router-dom'
import CommonModal from '../CommonModal'
import './PortfoliosNameModal.scss'
import NoRecord from '../../NoRecord/NoRecord'
import { PortfoliosNameModalProps } from '../../../../Utils/Interfaces'

export const PortfoliosNameModal = ({ show, handleClose, investedPortfolios }: PortfoliosNameModalProps) => {
  return (
    <CommonModal
      heading="Portfolios Name"
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="portfoliosnameModal"
    >
      <div className="commonContentModal">
        <ol>
          {investedPortfolios ? (
            investedPortfolios?.map((item: any) => (
              <li key={item?.name}>
                <Link to={`/admin/portfolioView?id=${item?._id}`}>
                  {item?.name}
                </Link>
              </li>
            ))
          ) : (
            <NoRecord text='Portfolio' shimmerType='table'/>
          )}
        </ol>
      </div>
    </CommonModal>
  )
}
