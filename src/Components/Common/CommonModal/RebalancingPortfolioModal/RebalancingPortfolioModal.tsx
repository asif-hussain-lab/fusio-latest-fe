import { Dispatch, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { callApiGetMethod, callApiPostMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import toaster from '../../../Common/Toast'
import CommonButton from '../../Button/CommonButton'
import InputCustom from '../../Inputs/InputCustom'
import CommonModal from '../CommonModal'
import './RebalancingPortfolioModal.scss'
import { REINVEST_REQUEST_STATUS } from '../../../../Utils/Utils'
import { RebalancingPortfolioModalProps } from '../../../../Utils/Interfaces'

export const RebalancingPortfolioModal = ({ show, handleClose, requestId }: RebalancingPortfolioModalProps) => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [requestsInfo, setRequestsInfo] = useState<any>()

  useEffect(() => {
    show && getRequestInfo()
  }, [show])

  const getRequestInfo = async () => {
    let result: any = await dispatch(callApiGetMethod('GET_REQUEST_INFO', { reqId: requestId }, false))
    if (result?.success) {
      setRequestsInfo(result?.data)
    }
  }

  const updateAssets = async () => {
    let signature: any = await dispatch(
      callApiGetMethod(
        'GET_UPDATE_ASSET_SIGNATURE',
        { portfolioId: requestsInfo?.portfolioId },
        false,
        true,
        'updateAsset'
      )
    )
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'updateCurrAndAllocOfPortfolio',
        [requestsInfo?.portfolioId, requestsInfo?.allocations, requestsInfo?.currencies, signature?.data?.signature],
        walletAddress,
        'portfolio',
        'accept'
      )
    )
    if (result?.status) {
      handleClose()
      toaster.success('Assets and allocations updated successfully')
    } else {
      console.log('error occured')
    }
  }

  const rejectReinvestRequest = async () => {
    const response: any = await dispatch(
      callApiPostMethod(
        'REJECT_REINVEST_REQUEST',
        {
          requestId: requestId,
        },
        true
      )
    )
    if (response?.success) {
      handleClose()
    }
  }

  function getStatus() {
    switch (requestsInfo?.status) {
      case REINVEST_REQUEST_STATUS.REJECTED:
      case REINVEST_REQUEST_STATUS.CANCELLED:
        return (
          <div>
            {requestsInfo?.portfolioName} <span className="red_text">{requestsInfo?.status}</span>
          </div>
        )
      case REINVEST_REQUEST_STATUS.PENDING:
        return (
          <div>
            {requestsInfo?.portfolioName} <span className="yellow_text">{requestsInfo?.status}</span>
          </div>
        )
      case REINVEST_REQUEST_STATUS.APPROVED:
      case REINVEST_REQUEST_STATUS.EXECUTED:
        return (
          <div>
            {requestsInfo?.portfolioName} <span className="green_text">{requestsInfo?.status}</span>
          </div>
        )
    }
  }

  return (
    <CommonModal
      heading={getStatus()}
      show={show}
      handleClose={handleClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="rebalancingPortfolioModal"
    >
      <div className="commonContentModal">
        <Row>
          <Col xs={12} md={6}>
            <div className="rebalancingPortfolio">
              <h5 className="mb-4 mt-5">Old Assets</h5>
              <Row>
                <Col xs={12} className="borderRight pe-md-4">
                  <Row>
                    <Col xs={7}>
                      <label className="form-label" htmlFor="Asset">
                        Asset
                      </label>
                    </Col>
                    <Col xs={5}>
                      <label className="form-label" htmlFor="Asset">
                        Allocation %
                      </label>
                    </Col>
                  </Row>
                  {requestsInfo?.oldCurrencies?.map((item: any) => {
                    return (
                      <Row className="assetRow" key={item?.address}>
                        <Col xs={7}>
                          <div className="customInput">
                            <div className="form-control d-flex align-items-center">
                              <img src={item?.icon} alt="btc" className="me-3 currencyLogo" /> <h6>{item?.symbol}</h6>
                            </div>
                          </div>
                        </Col>
                        <Col xs={5} key={item}>
                          <InputCustom
                            id="allocation"
                            name="allocation"
                            required
                            min={0}
                            placeholder=""
                            value={item?.allocation / 100}
                            disabled
                          >
                            <span className="allocP">%</span>
                          </InputCustom>
                        </Col>
                      </Row>
                    )
                  })}
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={12} md={6} className="mt-4 mt-md-0">
            <div className="rebalancingPortfolio">
              <h5 className="mb-4 mt-5">New Assets</h5>
              <Row>
                <Col xs={12} className="ps-md-4">
                  <Row>
                    <Col xs={7}>
                      <label className="form-label" htmlFor="Asset">
                        Asset
                      </label>
                    </Col>
                    <Col xs={5}>
                      <label className="form-label" htmlFor="Asset">
                        Allocation %
                      </label>
                    </Col>
                  </Row>
                  {requestsInfo?.newCurrencies?.map((item: any) => {
                    return (
                      <Row className="assetRow" key={item?.address}>
                        <Col xs={7}>
                          <div className="customInput">
                            <div className="form-control d-flex align-items-center">
                              <img src={item?.icon} alt="btc" className="me-3 currencyLogo" /> <h6>{item?.symbol}</h6>
                            </div>
                          </div>
                        </Col>
                        <Col xs={5} key={item}>
                          <InputCustom
                            id="allocation"
                            name="allocation"
                            required
                            min={0}
                            placeholder=""
                            value={item?.allocation / 100}
                            disabled
                          >
                            <span className="allocP">%</span>
                          </InputCustom>
                        </Col>
                      </Row>
                    )
                  })}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        {requestsInfo?.status === REINVEST_REQUEST_STATUS.PENDING && (
          <div className="groupBtn mt-5 pt-md-4 d-flex justify-content-center">
            <CommonButton
              title="Accept"
              className="greendark-btn me-3"
              onClick={updateAssets}
              buttonLoader={'accept'}
            />
            <CommonButton title="Reject" className="ms-3" onClick={rejectReinvestRequest} />
          </div>
        )}
      </div>
    </CommonModal>
  )
}
