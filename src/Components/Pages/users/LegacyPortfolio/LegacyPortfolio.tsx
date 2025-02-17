import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { DollarIcon, FilterIcon, InvestorIcon, ParcentageIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../../Services/common.service'
import { COUNTRY_TO_RESTRICT, PORTFOLIO_TYPE, PRICE_TYPE } from '../../../../Utils/Utils'
import CustomDropdown from '../../../Common/CustomDropdown/CustomDropdown'
import LegacyPortfolioCard from '../../../Common/LegacyPortfolioCard/LegacyPortfolioCard'
import Shimmer from '../../../Common/Shimmer/Shimmer'
import StockChart from '../../../Common/StockChart'
import CoinList from './CoinList/CoinList'
import InvestmentAmountCard from './InvestmentAmountCard/InvestmentAmountCard'
import InvestorList from './InvestorList/InvestorList'
import './LegacyPortfolio.scss'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'

const LegacyPortfolio = ({ admin }: { admin?: boolean }) => {
  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const country = useSelector((state: any) => state.user.country)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<string>('')
  const [portfolioDetails, setPortfolioDetails] = useState<any>({})
  const prevRefreshUserData = useRef(refreshUserData)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)
  const handleDisclaimerClose = () => setShowDisclaimer(false)
  
  useEffect(() => { 
    if (id) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getPortfolioDetails(false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getPortfolioDetails()
      }
    }
  }, [id, walletAddress, refreshUserData, filter])

  useEffect(() => {
    if (id && portfolioDetails && country) {
      if (admin) {
        setShowDisclaimer(false)
      } else if (country === COUNTRY_TO_RESTRICT) {
        setShowDisclaimer(true)
      }
    }
  }, [id])

  const getPortfolioDetails = useCallback(
    async (loading = true) => {
      if (loading) setLoading(true)
      let obj: { id: any; user: string; timeDuration?: string } = {
        id: id,
        user: walletAddress,
      }
      if (filter) {
        obj.timeDuration = filter
      }
      let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_DETAILS', obj, false))
      if (result?.success) {
        setPortfolioDetails(result?.data)
      }
      setLoading(false)
    },
    [dispatch, id, walletAddress, refreshUserData, filter]
  )

  const legacydata = [
    {
      icon: <DollarIcon />,
      title: 'TVL',
      no: portfolioDetails?.totalInvestedAmount
        ? `${divideBigNumber(portfolioDetails?.totalInvestedAmount?.$numberDecimal, tokenDecimals)} ${tokenSymbol}`
        : 0,
    },
    {
      icon: <ParcentageIcon />,
      title: 'Est. Returns',
      no: portfolioDetails?.expectedReturns ? `${portfolioDetails?.expectedReturns}` : '-',
    },
    {
      icon: <InvestorIcon />,
      title: 'No. of investors',
      no: portfolioDetails?.investors ? portfolioDetails?.investors : 0,
    },
  ]

  return (
    <div className={`legacyPortfolio ${admin ? '' : 'pt-40'} pb-40`}>
      <Container className={admin ? 'px-0 adminLegacydata' : ''}>
        <div className="commonTopbar p-4 px-md-5 d-md-flex align-items-center justify-content-between" style={{minHeight: "100px"}}>
          {portfolioDetails?.portfolioName && (
            <h3>
              {portfolioDetails?.portfolioName} ({portfolioDetails?.portfolioTicker})
            </h3>
          )}
          {!admin && (
            <span className="exploreFilter ms-sm-4 my-4 my-sm-0">
              <CustomDropdown
                onSelect={(e: any) => setFilter(e.value)}
                options={PRICE_TYPE}
                defaultOption={PRICE_TYPE[3]}
                placeholder="Yearly"
                icon={<FilterIcon />}
              />
            </span>
          )}
        </div>
        <div>
          <Row className="mt-0 mt-md-4">
            {legacydata.map((item) => {
              return (
                <Col key={item.title} xs={12} md={4} xl={4} className="mt-5 mt-lg-0 d-flex">
                  <LegacyPortfolioCard icon={item.icon} title={item.title} no={item.no} />
                </Col>
              )
            })}
          </Row>
        </div>
        <Row className="mt-4">
          <Col xs={12} lg={4} xl={3} className="d-flex">
            <CoinList assets={portfolioDetails?.currencies} loading={loading} priceType={filter} />
          </Col>
          <Col xs={12} lg={8} xl={6} className="mt-5 mt-lg-0 d-flex">
            <div className="w-100 chartBg">
              {portfolioDetails?.portfolioId ? (
                <StockChart id={portfolioDetails?.portfolioId} priceType={filter || 'yearly'} />
              ) : (
                <Shimmer />
              )}
            </div>
          </Col>

          <Col xs={12} lg={12} xl={3} className="mt-5 mt-xl-0 d-flex">
            {admin ? (
              <InvestorList id={portfolioDetails?.portfolioId} />
            ) : (
              portfolioDetails?.portfolioId && (
                <InvestmentAmountCard
                  portfolio={portfolioDetails}
                  pendingInvestRequest={portfolioDetails?.pendingInvestRequest}
                  pendingWithdrawRequest={portfolioDetails?.pendingWithdrawRequest}
                  pendingRebalanceRequest={portfolioDetails?.pendingRebalanceRequest}
                  aumFees={portfolioDetails?.aumFees}
                  callBack={getPortfolioDetails}
                  disabled={
                    !portfolioDetails?.isEnable ||
                    portfolioDetails?.pendingWithdrawRequest ||
                    portfolioDetails?.pendingRebalanceRequest
                  }
                />
              )
            )}
          </Col>
        </Row>
      </Container>
      <RestrictionModal show={showDisclaimer} handleClose={handleDisclaimerClose} heading="Regulation">
        <p className="custom-p">
          Due to regulatory and compliance, any resident residing within the USA are restricted from access.
        </p>
      </RestrictionModal>
    </div>
  )
}
export default LegacyPortfolio
