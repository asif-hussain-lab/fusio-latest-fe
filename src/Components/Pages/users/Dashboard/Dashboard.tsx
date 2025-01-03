import moment from 'moment'
import { Dispatch, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Col, Container, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useSearchParams } from 'react-router-dom'
import { DollarIcon, InvestorIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { divideBigNumber, fixedToDecimal, getTrends } from '../../../../Services/common.service'
import TransactionHistoryTable from '../../../Common/CommonTable/TransactionHistoryTable/TransactionHistoryTable'
import InvestedCard from '../../../Common/InvestedCard/InvestedCard'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import PortfolioChart from '../../../Common/PortfolioChart'
import AllInvestment from '../LegacyPortfolio/AllInvestment/AllInvestment'
import MyNftPage from '../MyNftPage/MyNftPage'
import MyOrderPage from '../MyOrderPage/MyOrderpage'
import RebalanceRequests from '../RebalanceRequests/RebalanceRequests'
import WithdrawRequests from '../WithdrawRequests/WithdrawRequests'
import AssetDetails from './AssetDetails/AssetDetails'
import './Dashboard.scss'
import NoRecordInvestment from '../../../Common/NoRecord/NoRecordInvestment'
import { COUNTRY_TO_RESTRICT } from '../../../../Utils/Utils'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'
import PercentageChange from '../../../Common/PercentageChange/PercentageChange'

const UserDashboard = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const [whitelistedTokenList, setWhitelistedTokenList] = useState<any>([])
  const country = useSelector((state: any) => state.user.country)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [allInvestments, setAllInvestments] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [returns, setReturns] = useState<any>()
  const [portfolioForGraph, setPortfolioForGraph] = useState<any>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeKey, setActiveKey] = useState<any>('')
  const [activeKeyInner, setActiveKeyInner] = useState<any>('all')
  const prevRefreshUserData = useRef(refreshUserData)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)

  const handleDisclaimerClose = () => setShowDisclaimer(false)

  useEffect(() => {
    if (country === COUNTRY_TO_RESTRICT) {
      setShowDisclaimer(true)
    }
  }, [])

  useEffect(() => {
    getWhitelistedTokenList()
}, [])

const getWhitelistedTokenList = useCallback(
  async (page: number = 1, loading = true) => {
    const obj: { page: number; limit: number } = {
      page: page,
      limit: 107,
    }
    if (loading) setLoading(true)
    let result: any = await dispatch(callApiGetMethod('GET_WHITELISTED_TOKENS', obj, false))
    if (result?.success) {
      setWhitelistedTokenList(result?.data?.docs)
      
    }
    setLoading(false)
  },
  [dispatch]
)

  const getAllInvestments = useCallback(
    async (loading = true) => {
      try {
        if (loading) setLoading(true)
        const obj: { user?: string } = {}
        if (walletAddress) {
          obj.user = walletAddress
        }
        let result: any = await dispatch(callApiGetMethod('GET_ALL_INVESTMENTS_FOR_USER', obj, false))
        if (result?.success) {
          setAllInvestments(result?.data[0])
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('Error occurred in getAllInvestments:', error)
      }
    },
    [dispatch, walletAddress, refreshUserData]
  )

  useEffect(() => {
    activeKey && setSearchParams({ tab: activeKey })
  }, [activeKey])

  useEffect(() => {
    let activeTab = searchParams.get('tab')
    if (activeTab) {
      setActiveKey(activeTab)
    } else {
      setActiveKey('portfolio')
    }
  }, [searchParams])

  useEffect(() => {
    if (activeKey === 'portfolio') {
      if (walletAddress && tokenDecimals) {
        if (prevRefreshUserData.current !== refreshUserData) {
          getAllInvestments(false)
          prevRefreshUserData.current = refreshUserData
        } else {
          getAllInvestments()
        }
      } else {
        setLoading(false)
        setAllInvestments('')
      }
    }
  }, [walletAddress, activeKey, tokenDecimals, refreshUserData])

  useEffect(() => {
    if (allInvestments) {
      getReturns(allInvestments?.allPortfoliosCurruntValue, allInvestments?.totalInvestment?.$numberDecimal)
    } else {
      setReturns(0)
    }
  }, [allInvestments])

  const investeddata = [
    {
      icon: <DollarIcon />,
      value: 'Current Value',

      name: `${fixedToDecimal(allInvestments?.allPortfoliosCurruntValue) || '0'} ${tokenSymbol || 'USDC'}`,
      text: 'Returns:',
      returnsno: returns || '0',
    },
    {
      icon: <InvestorIcon />,
      value: 'Invested Amount',
      name: `${
        allInvestments ? divideBigNumber(allInvestments?.totalInvestment?.$numberDecimal, tokenDecimals) : '0'
      } ${tokenSymbol || 'USDC'}`,
      text: `As of ${moment().format('DD MMM YYYY')}`,
      amount: returns || '',
    },
  ]

  const getReturns = async (currentValue: any, previousValue: any) => {
    try {
      let result = await getTrends(currentValue, previousValue)
      setReturns(result)
    } catch (error) {
      console.error('Error occurred in getReturns:', error)
    }
  }
  const ref: any = useRef()

  const onclick = () => {
    if (ref.current && document.body.clientWidth < 1199) {
      ref.current.click()
    }
  }
 
  const AllInvestedCard = useMemo(() => allInvestments?.investments, [allInvestments])
  return (
    <div className="dashboardUser pt-40">
      
      <Container>
        <Tab.Container
          id="coin_TableInner"
          activeKey={activeKey}
          defaultActiveKey={activeKey}
          onSelect={(e) => setActiveKey(e)}
        >
          
          <Tab.Content>
            <Tab.Pane eventKey="portfolio">
              <Row>
                <Col xs={12} lg={8}>
                  <Row>
                    {investeddata.map((item) => {
                      return (
                        <Col key={item.value} xs={12} md={6} className="d-flex">
                          <InvestedCard
                            className="dashboard_invecards"
                            icon={item.icon}
                            value={item.value}
                            name={item.name}
                            text={item.text}
                            amount={item.amount}
                            returnsNo={item.returnsno}
                          />
                        </Col>
                      )
                    })}
                  </Row>
                  <div className="tradeImg mt-4">
                    {walletAddress && allInvestments ? (
                      <PortfolioChart data={activeKeyInner === 'all' ? 'all' : portfolioForGraph} />
                    ) : (
                      <NoRecord loading={loading} shimmerType="box" text="Record" />
                    )}
                  </div>
                </Col>
                <Col xs={12} lg={4} className="mt-5 mt-lg-0">
                  <div className="allInvestmentcard">
                    <h5>All Investment</h5>
                    <div className="allInvestmentcard_scrollList">
                      {allInvestments ? (
                        <AllInvestment
                          AllInvestedCard={AllInvestedCard}
                          callBack={setPortfolioForGraph}
                          setActiveKeyInner={setActiveKeyInner}
                          selectedPf={portfolioForGraph}
                        />
                      ) : (
                        <div className="no_record_found">
                          <NoRecordInvestment loading={loading} text="Investments" shimmerType="table" />
                          {loading ? (
                            ''
                          ) : (
                            <NavLink onClick={onclick} to="/explore" className="btn-style">
                              Go to Explore
                            </NavLink>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              {allInvestments && (
                <Tab.Container
                  id="coin_TableInner"
                  activeKey={activeKeyInner}
                  defaultActiveKey={activeKeyInner}
                  onSelect={(e) => setActiveKeyInner(e)}
                >
                  <div className="commonTopbar mt-4">
                    <Nav className="tab_sec Border_Tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="all">All Assets</Nav.Link>
                      </Nav.Item>
                      {portfolioForGraph && (
                        <Nav.Item>
                          <Nav.Link eventKey="selected">
                            Asset Allocation For {portfolioForGraph?.portfolioName}
                          </Nav.Link>
                        </Nav.Item>
                      )}
                    </Nav>
                  </div>
                  <Tab.Content>
                    <Tab.Pane eventKey="all">
                      {activeKeyInner === 'all' && (
                        <Row>
                          <Col xs={12}>
                            <AssetDetails activeKeyInner={activeKeyInner} />
                          </Col>
                        </Row>
                      )}
                    </Tab.Pane>
                    <Tab.Pane eventKey="selected">
                      {activeKeyInner === 'selected' && (
                        <Row>
                          <Col xs={12}>
                            <AssetDetails selectedPf={portfolioForGraph} activeKeyInner={activeKeyInner} />
                          </Col>
                        </Row>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              )}
              <div className="commonTopbar d-md-flex align-items-center justify-content-between mobileHeight" style={{marginTop:'1.8rem'}}>
                <Nav className="tab_sec Border_Tabs">
                  <Nav.Item>
                    <Nav.Link >All Assets</Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
              <div className="coinListD">
                  <div className="coinList_listBox" style={{height: 'auto'}}>
                    <Row>
                    {whitelistedTokenList?.map((item: any, index: number) => (
                      <Col xs={3} key={item._id}>
                        <div className="CoinList_card">
                          <div className="coin_info">
                            <img src={item?.icon} alt="Currency-Logo" className="currencyLogo" />
                            <h6>{item?.name}</h6>
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

            </Tab.Pane>
            <Tab.Pane eventKey="transactionhistory">
              {activeKey === 'transactionhistory' && <TransactionHistoryTable />}
            </Tab.Pane>
            <Tab.Pane eventKey="mynft">{activeKey === 'mynft' && <MyNftPage />}</Tab.Pane>
            <Tab.Pane eventKey="myorders">{activeKey === 'myorders' && <MyOrderPage />}</Tab.Pane>
            <Tab.Pane eventKey="withdrawRequests">{activeKey === 'withdrawRequests' && <WithdrawRequests />}</Tab.Pane>
            <Tab.Pane eventKey="rebalanceRequests">
              {activeKey === 'rebalanceRequests' && <RebalanceRequests />}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
              
      </Container>

      <RestrictionModal show={showDisclaimer} handleClose={handleDisclaimerClose} heading="Regulation">
        <p className="custom-p">
          Due to regulatory and compliance, any resident residing within the USA are restricted from access.
        </p>
      </RestrictionModal>
    </div>
  )
}

export default memo(UserDashboard)
