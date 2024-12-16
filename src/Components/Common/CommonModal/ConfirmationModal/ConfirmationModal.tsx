import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import CommonButton from '../../Button/CommonButton'
import CommonModal from '../CommonModal'
import './ConfirmationModal.scss'
import { ConfirmationModalProps } from '../../../../Utils/Interfaces'

export const ConfirmationModal = ({ text, show, handleClose, callBack, itemId, buttonLoader }: ConfirmationModalProps) => {
  const dispatch: Dispatch<any> = useDispatch()
  const location = useLocation()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')
  const [portfolioDetails, setPortfolioDetails] = useState<any>([])
  const [userInvestmentInfo, setUserInvestmentInfo] = useState<any>()

  const getPortfolioDetails = async () => {
    let obj: { user: string; id?: number } = {
      user: walletAddress,
    }
    if (itemId) {
      obj.id = itemId
    }
    let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_DETAILS', obj, false))
    if (result?.success) {
      setPortfolioDetails(result?.data)
    }
  }

  const getUserInvestmentInfo = async () => {
    let result: any = await dispatch(
      callApiGetMethod('GET_USERINVESTMENT_INFO', { user: walletAddress, portfolioId: id }, false)
    )
    if (result?.success) {
      setUserInvestmentInfo(result?.data)
    }
  }

  useEffect(() => {
    show && (buttonLoader === 'rebalancePortfolio' || buttonLoader === 'rebalanceMyPortfolio') && getPortfolioDetails()
    buttonLoader === 'invest' && show && getUserInvestmentInfo()
  }, [show])

  return (
    <CommonModal
      heading
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="confirmationModal"
    >
      <div className="commonContentModal text-center">
        <h5>{text}</h5>
        {portfolioDetails?.pendingWithdrawRequest && (
          <h6 className="yellow_text mt-3 mb-5">
            You have pending withdraw request. Please wait for approval or cancel that.
          </h6>
        )}
        {portfolioDetails?.pendingInvestRequest && (
          <h6 className="yellow_text mt-3 mb-5">
            You have pending invest request. Please wait for approval or cancel that.
          </h6>
        )}
        {portfolioDetails?.pendingRebalanceRequest && (
          <h6 className="yellow_text mt-3 mb-5">
            You have pending rebalance request. Please wait for approval or cancel that.
          </h6>
        )}
        {buttonLoader === 'invest' && userInvestmentInfo && !userInvestmentInfo?.isRebalanced && (
          <h6 className="red_text mt-4 mb-5">
            Note: With this investment your portfolio will be rebalanced as per the new allocation.*
          </h6>
        )}
        <div className="btnGroup d-flex mt-5 pt-xl-4">
          <CommonButton title="No" className="w-50 me-3 greendark-btn" onClick={handleClose} />
          <CommonButton
            title="Yes"
            className="w-50 ms-3"
            onClick={callBack}
            buttonLoader={buttonLoader}
            disabled={
              (buttonLoader === 'rebalancePortfolio' || buttonLoader === 'rebalanceMyPortfolio') &&
              (portfolioDetails?.pendingWithdrawRequest ||
                portfolioDetails?.pendingRebalanceRequest ||
                portfolioDetails?.pendingInvestRequest)
            }
          />
        </div>
      </div>
    </CommonModal>
  )
}
