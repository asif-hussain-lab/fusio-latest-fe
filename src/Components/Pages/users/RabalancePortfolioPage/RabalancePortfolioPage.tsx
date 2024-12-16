import { Dispatch, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractGetMethod, callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { divideWithDecimal } from '../../../../Services/common.service'
import CommonButton from '../../../Common/Button/CommonButton'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import InputCustom from '../../../Common/Inputs/InputCustom'
import toaster from '../../../Common/Toast'
import './RebalancePortfolioPage.scss'

export const RebalancePortfolioPage = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const [rebalancingInfo, setRebalancingInfo] = useState<any>()
  const [rebalnceMyPortfolioFee, setRebalnceMyPortfolioFee] = useState<any>('')
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')

  useEffect(() => {
    getRebalnceMyPortfolioFee()
    walletAddress && id && getRebalancingInfo()
  }, [id, walletAddress])

  const getRebalancingInfo = async () => {
    let result: any = await dispatch(callApiGetMethod('GET_REALLOCATION_INFO', { processId: id }, false))
    if (result?.success) {
      setRebalancingInfo(result?.data)
    }
  }

  const getRebalnceMyPortfolioFee = async () => {
    let result: any = await dispatch(
      callContractGetMethod('reBalancesMyPortfolioMinimumAmount', [], 'portfolio', false)
    )
    if (result) {
      setRebalnceMyPortfolioFee(result)
    }
  }

  const rebalanceMyPortfolio = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'reBalanceMyPortfolio',
        [rebalancingInfo?.portfolioId, rebalnceMyPortfolioFee, id],
        walletAddress,
        'orderExecution',
        'rebalanceMyPortfolio'
      )
    )
    if (result?.status) {
      toaster.success('Portfolio rebalancing request submitted successfully')
      handleClose()
    } else {
      console.log('error occured')
    }
  }

  return (
    <div className="dashboardUser pt-40">
      <Container>
        <div className="fundForm commonBasecard">
          <Row>
            <h4>
              <Link to={`/portfolioView?id=${rebalancingInfo?.portfolioId}`} className="yellow_text">
                {rebalancingInfo?.portfolioName}
              </Link>{' '}
              Assets Allocation
            </h4>
            <Col xs={12} md={6}>
              <div className="rebalancingPortfolio">
                <h5 className="mb-4 mt-5">Old Assets Allocation</h5>
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
                    {rebalancingInfo?.oldCurrencies?.map((item: any, index: number) => {
                      return (
                        <Row className="assetRow" key={item?.address}>
                          <Col xs={7}>
                            <div className="customInput">
                              <div className="form-control d-flex align-items-center">
                                <img src={item?.icon} alt="Currency-Logo" className="me-3 currencyLogo" />{' '}
                                <h6>{item?.symbol}</h6>
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
                <h5 className="mb-4 mt-5">New Assets Allocation</h5>
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
                    {rebalancingInfo?.newCurrencies?.map((item: any, index: number) => {
                      return (
                        <Row className="assetRow" key={item?.address}>
                          <Col xs={7}>
                            <div className="customInput">
                              <div className="form-control d-flex align-items-center">
                                <img src={item?.icon} alt="Currency-Logo" className="me-3 currencyLogo" />{' '}
                                <h6>{item?.symbol}</h6>
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
          <div className="groupBtn mt-5 pt-md-4 d-flex justify-content-center">
            <CommonButton title="Rebalance My Portfolio" className="me-3" onClick={handleShow} />
          </div>
        </div>
      </Container>
      <ConfirmationModal
        text={`You will be charged ${divideWithDecimal(
          rebalnceMyPortfolioFee ?? '0',
          tokenDecimals
        )} ${tokenSymbol} for rebalancing. Are you sure you want to rebalance portfolio?`}
        show={show}
        handleClose={handleClose}
        callBack={rebalanceMyPortfolio}
        itemId={rebalancingInfo?.portfolioId}
        buttonLoader="rebalanceMyPortfolio"
      />
    </div>
  )
}
