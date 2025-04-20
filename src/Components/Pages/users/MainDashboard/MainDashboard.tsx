import moment from 'moment'
import { Dispatch, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cardBg from '../../../../Assets/Images/exploreCardBg.png'
import { Col, Container, Row, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom'
import { DollarIcon, InvestorIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { divideBigNumber, fixedToDecimal, getTrends } from '../../../../Services/common.service'
import './Dashboard.scss'
import NoRecordInvestment from '../../../Common/NoRecord/NoRecordInvestment'
import { COUNTRY_TO_RESTRICT } from '../../../../Utils/Utils'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'
import BNB from '../../../../Assets/Images/bnb.png'
import PercentageChange from '../../../Common/PercentageChange/PercentageChange'
import '../LegacyPortfolio/CoinList/CoinList.scss'
import CurrencyCard from '../../../Common/CurrencyCard/CurrencyCard'
import PortfolioCards from '../../../Common/PortfolioCards/PortfolioCards'

import dummmyProfile from '../../../../Assets/dummyProfile.png'
import TvlGraph from '../../../Common/TvlGraph/TvlGraph'
import CuratedPortfolios from '../../../Common/CuratedPortfolios/CuratedPortfolios'

const MainDashboard = () => {
  const navigate = useNavigate()
  const [whitelistedTokenList, setWhitelistedTokenList] = useState<any>([])
  const dispatch: Dispatch<any> = useDispatch()
  const [loading, setLoading] = useState<boolean>(true)
  const [portfolioList, setPortfolioList] = useState<any>()

  useEffect(() => {
    getWhitelistedTokenList()
    getPortfolioList()
  }, [])

  const getWhitelistedTokenList = useCallback(
    async (page: number = 1, loading = true) => {
      const obj: { page: number; limit: number } = {
        page: page,
        limit: 4,
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_WHITELISTED_TOKENS', obj, false))
      if (result?.success) {
        setWhitelistedTokenList(result?.data?.docs)
        console.log(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch]
  )

  const getPortfolioList = useCallback(
    async (page: number = 1, loading = true) => {
      try {
        let obj: {
          page: number
          limit: number
          isEnable?: boolean
        } = {
          page: 1,
          limit: 3,
          isEnable: true,
        }

        if (loading) setLoading(true)
        let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_LIST', obj, false))
        if (result?.success) {
          setPortfolioList(result?.data?.docs)
          console.log('Portfolio', result?.data?.docs)
        }
        setLoading(false)
      } catch (error) {}
    },
    [dispatch]
  )

  return (
    <div className="commonContentModal pt-40 pb-40">
      <Container>
        <div className="fundForm commonBasecard mrq" style={{ background: '#FFFFFF1A' }}>
          <div
            className="flex justify-between items-center text-white bg-no-repeat p-5 rounded-xl shadow-md bg-cover mb-4"
            style={{
              backgroundImage: `url(${cardBg})`,
              backgroundSize: 'cover',
              borderRadius: '15px',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">{'Welcome to Fusio!'}</h2>
                <h6 className="mt-2" style={{ fontWeight: 100 }}>
                  A simple to use platform for both new and experienced crypto investors to create their own diversified
                  <br />
                  portfolios or invest in a curated one.
                </h6>
              </div>
            </div>
          </div>
          <Row>
            <Col xs={12}>
              <section className="marketTrend">
                <Row>
                  <Col md={6}>
                    <div>
                      <h1 className="theme-sensitive-heading">Market Trend</h1>

                      <div className="coinListD">
                        <div className="coinList_listBox" style={{ height: 'auto' }}>
                          <Row>
                            {whitelistedTokenList?.map((item: any, index: number) => (
                              <Col xs={12} md={6} key={item._id}>
                                <div className="CoinList_card">
                                  <div className="coin_info">
                                    <img src={item?.icon} alt="Currency-Logo" className="currencyLogo" />
                                    <h6 style={{ fontSize: '14px' }}>{item?.name}</h6>
                                    <h6>({item?.symbol})</h6>
                                  </div>
                                  <div className="coin_info">
                                    <PercentageChange
                                      changeStatus={item?.tokenPriceInfo?.priceStatus}
                                      percentageChange={item?.tokenPriceInfo?.percentageChange}
                                      toolTipText="Changes in last 1 hour"
                                    />
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <h1 className="theme-sensitive-heading">Top Curated portfolios</h1>
                      <div>
                        <Row>
                          {portfolioList?.map((portfolioListItem: any) => (
                            <Col xs={12} md={4} key={portfolioListItem._id}>
                              <PortfolioCards
                                image={dummmyProfile}
                                name={portfolioListItem?.portfolioName}
                                returnValue={portfolioListItem?.expectedReturns}
                                onClick={() => navigate(`/portfolioView?id=${portfolioListItem?.portfolioId}`)}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  </Col>
                </Row>
              </section>
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <section className="dashboardCharts">
                <Row style={{ gap: '2%' }}>
                  <Col sm={12} md={6}>
                    <div className="dashboardChartsDiv">
                      <h1 className="mb-4 theme-sensitive-heading">BTC Price</h1>
                      <section>
                        <TvlGraph />
                      </section>
                    </div>
                  </Col>
                  <Col sm={12} md={6}>
                    <div className="dashboardChartsDiv">
                      <h1 className="mb-4 theme-sensitive-heading">How to invest in curated portfolios:</h1>
                      <div style={{ height: '100%' }}>
                        <CuratedPortfolios />
                      </div>
                    </div>
                  </Col>
                </Row>
              </section>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default memo(MainDashboard)
