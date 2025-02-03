import { Dispatch, memo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { EditIcon, SuitcaseIcon } from '../../../Assets/svgImgs/svgImgs'
import { callContractSendMethod } from '../../../Redux/Actions/contract.action'
import { PORTFOLIO_TYPE } from '../../../Utils/Utils'
import { ConfirmationModal } from '../CommonModal/ConfirmationModal/ConfirmationModal'
import CustomDropdown from '../CustomDropdown/CustomDropdown'
import CustomTooltip from '../CustomTooltip/CustomTooltip'
import Switch from '../FormInputs/Switch'
import toaster from '../Toast'
import './ManageCard.scss'
import { InfoIcon } from '../../../Assets/Images/Icons/SvgIcons'
import { ManageCardProps } from '../../../Utils/Interfaces'
import PortfolioImage from '../PortfolioImage'


const ManageCard = (props: ManageCardProps) => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [showConfModal, setShowConfModal] = useState(false)
  const [refreshDropdown, setRefreshDropdown] = useState<any>(true)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleConfModalShow = () => setShowConfModal(true)

  const getConfirmationText = () => {
    try {
      if (props?.portfolioType === 1 || props?.portfolioType === 3) {
        return props.isEnabled ? 'disable' : 'enable'
      }
      if (props?.portfolioType === 2) {
        return props.isList ? 'unlist' : 'list'
      }
      return null
    } catch (error) {
      console.error('Error occurred in getConfirmationText:', error)
      return null
    }
  }

  const changePortfolioStatus = async () => {
    try {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'enableOrDisablePortfolio',
          [props.portfolioId],
          walletAddress,
          'portfolio',
          'enableOrDisable'
        )
      )
      if (result?.status) {
        handleConfModalClose()
        toaster.success(`${props.heading} ${props.isEnabled ? 'disabled' : 'enabled'}`)
      }
    } catch (error) {
      console.error('Error occurred during enable/disable portfolio:', error)
      toaster.error('An error occurred while processing the request')
    }
  }

  const setListorUnlist = async () => {
    try {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'listAndUnlistPortfolio',
          [props.portfolioId],
          walletAddress,
          'portfolio',
          'listOrUnlist'
        )
      )
      if (result?.status) {
        handleConfModalClose()
        toaster.success(`${props.heading} ${props.isList ? 'Unlisted' : 'Listed'}`)
      }
    } catch (error) {
      console.error('Error occurred during list/unlist portfolio:', error)
      toaster.error('An error occurred while processing the request')
    }
  }

  const selectListUnList = () => {
    handleConfModalShow()
    setRefreshDropdown(false)
    setTimeout(() => {
      setRefreshDropdown(true)
    }, 5)
  }

  return (
    <>
      <div className={`manageCard ${props?.addClass}`} id={props?.portfolioId}>
        <div className="manageCard_Iconbox">
          <PortfolioImage heading={props?.heading} />
        </div>
        <div className="manageCard_Details" onClick={() => props?.onClick && props?.onClick(props?.portfolioId)}>
          <h5>{props?.heading}</h5>
          <h6>
            <strong>Ticker:</strong> {props.ticker}
          </h6>
          {props?.asset && (
            <h6>
              <strong>Assets:</strong>{' '}
              {props?.asset?.map((asset: any, i: number) => {
                if (asset?.allocation > 0)
                  return (
                    <span key={asset?.symbol}>
                      {i > 0 && ', '}
                      {asset?.symbol}
                    </span>
                  )
              })}
            </h6>
          )}
          {props?.cate && (
            <h6>
              <strong>Allocations:</strong>{' '}
              {props?.asset?.map((asset: any, i: number) => {
                if (asset?.allocation > 0)
                  return (
                    <span key={asset?.allocation * i}>
                      {i > 0 && ', '}
                      {asset?.allocation ? asset?.allocation / 100 : 0}%
                    </span>
                  )
              })}
            </h6>
          )}
          {props?.returns && (
            <h6>
              <strong>Expected Returns:</strong> {props.returns}
            </h6>
          )}
          {props?.minInvestment && (
            <h6>
              <strong>Minimum Investment:</strong> {props.minInvestment}%
            </h6>
          )}

          {props?.expenseRatio && (
            <h6>
              <strong>Expense Ratio:</strong> {props.expenseRatio}%
            </h6>
          )}

          {props?.fees && (
            <h6 className="d-flex">
              <strong>Transaction Fees:&nbsp;</strong> {props?.fees / 100}%
              <CustomTooltip
                className="ms-1"
                icon={<InfoIcon />}
                text={`Transaction Fees: ${props?.fees / 100}% deducted on deposit, ${
                  props?.fees / 100
                }% on withdrawal!`}
              />
            </h6>
          )}
        </div>
        <div className="manageCard_EditDeleteIcon">
          {!props?.admin && props?.portfolioType === PORTFOLIO_TYPE.cf && refreshDropdown && (
            <CustomDropdown
              options={props?.options}
              value={props?.isList}
              defaultOption={props?.defaultOption}
              placeholder="List"
              onSelect={selectListUnList}
            />
          )}
          {props?.portfolioType !== PORTFOLIO_TYPE.cf && props?.deleteicon && (
            <span className="SwitchToggle">
              <Switch onChange={handleConfModalShow} checked={props?.isEnabled} />
            </span>
          )}
          {props?.portfolioType !== PORTFOLIO_TYPE.byop && props?.editicon && (
            <span className="editIcon">
              <Link
                to={
                  props?.admin
                    ? `/admin/portfolio/manage-portfolio/editPortfolio?id=${props?.portfolioId}`
                    : `/editPortfolio?id=${props?.portfolioId}`
                }
              >
                <EditIcon />
              </Link>
            </span>
          )}
        </div>
        <Link
          to={
            props?.admin ? `/admin/portfolioView?id=${props?.portfolioId}` : `/portfolioView?id=${props?.portfolioId}`
          }
          className="viewAlllink"
        >
          View
        </Link>
        {props?.loading && (
          <div className="no_record_box">
            <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
            <h4>Loading...</h4>
          </div>
        )}
      </div>
      <ConfirmationModal
        text={`Are you sure you want to ${getConfirmationText()} ${props?.heading}?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={props?.portfolioType === PORTFOLIO_TYPE.cf ? setListorUnlist : changePortfolioStatus}
        buttonLoader={props?.portfolioType === PORTFOLIO_TYPE.cf ? 'listOrUnlist' : 'enableOrDisable'}
      />
    </>
  )
}

export default memo(ManageCard)
