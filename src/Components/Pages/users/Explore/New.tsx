import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'
import { Col, Container, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { FilterIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import {
  CARDLIMIT,
  COUNTRY_TO_RESTRICT,
  PORTFOLIO_TYPE,
  RETURNS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
} from '../../../../Utils/Utils'
import CustomDropdown from '../../../Common/CustomDropdown/CustomDropdown'
import AssetDetails from '../Dashboard/AssetDetails/AssetDetails'
import Switch from '../../../Common/FormInputs/Switch'
import ManageCard from '../../../Common/ManageCard/ManageCard'
import PortfolioChart from '../../../Common/PortfolioChart'
import NoRecordInvestment from '../../../Common/NoRecord/NoRecordInvestment'
import InvestedCard from '../../../Common/InvestedCard/InvestedCard'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import AllInvestment from '../LegacyPortfolio/AllInvestment/AllInvestment'
import Pagination from '../../../Common/Paginations/Paginations'
import './Explore.scss'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'
import { DollarIcon, InvestorIcon } from '../../../../Assets/svgImgs/svgImgs'
import { divideBigNumber, fixedToDecimal } from '../../../../Services/common.service'

const Explore = () => {
  const navigate = useNavigate()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const country = useSelector((state: any) => state.user.country)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [portfolioList, setPortfolioList] = useState<any>()
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [portfolioForGraph, setPortfolioForGraph] = useState<any>()
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [filterPortfolioType, setFilterPortfolioType] = useState<any>('')
  const [filterReturnType, setFilterReturnType] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [activeKey, setActiveKey] = useState<any>('')
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const prevRefreshUserData = useRef(refreshUserData)
  const filterOptionsForType = useMemo(() => TYPE_FILTER_OPTIONS, [])
  const filterOptionsForReturns = useMemo(() => RETURNS_FILTER_OPTIONS, [])
  const [activeKeyInner, setActiveKeyInner] = useState<any>('all')
  const [allInvestments, setAllInvestments] = useState<any>()
  const [returns, setReturns] = useState<any>()
  const AllInvestedCard = useMemo(() => allInvestments?.investments, [allInvestments])

  const options = useMemo(
    () => [
      { value: true, label: 'List' },
      { value: false, label: 'Unlist' },
    ],
    []
  )

  const addClass = {
    2: 'gradientbox2',
    3: 'gradientbox1',
    4: 'gradientbox3',
  }

  const handleDisclaimerClose = () => setShowDisclaimer(false)

  useEffect(() => {
    if (country === COUNTRY_TO_RESTRICT) {
      setShowDisclaimer(true)
    }
  }, [])

  useEffect(() => {
    activeKey && setSearchParams({ tab: activeKey })
  }, [activeKey])

  useEffect(() => {
    let activeTab = searchParams.get('tab')
    if (activeTab) {
      setActiveKey(activeTab)
    } else {
      setActiveKey('allFunds')
    }
  }, [searchParams])

  useEffect(() => {
    if (activeKey) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getPortfolioList(currentPage, false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getPortfolioList()
      }
    }
  }, [isEnabled, filterPortfolioType, filterReturnType, activeKey, walletAddress, refreshUserData])

  const setEnableDisable = () => {
    if (isEnabled) {
      setIsEnabled(false)
    } else {
      setIsEnabled(true)
    }
  }
  const ref: any = useRef()

  const onclick = () => {
    if (ref.current && document.body.clientWidth < 1199) {
      ref.current.click()
    }
  }

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

  const getPortfolioList = useCallback(
    async (page: number = 1, loading = true) => {
      try {
        let obj: {
          page: number
          limit: number
          createdBy?: string
          isEnable?: boolean
          portfolioType?: number
          expectedReturns?: string
          user?: string
        } = {
          page: page,
          limit: CARDLIMIT,
          isEnable: isEnabled,
          user: walletAddress,
        }

        if (filterPortfolioType) {
          obj.portfolioType = filterPortfolioType
        }

        if (filterReturnType) {
          obj.expectedReturns = filterReturnType
        }

        if (activeKey === 'myFunds') {
          obj.createdBy = walletAddress || 'none'
        }
        if (loading) setLoading(true)
        let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_LIST', obj, false))
        if (result?.success) {
          setTotalPage(result?.data?.totalPages)
          setCurrentPage(page)
          setTotalData(result?.data?.totalDocs)
          setPortfolioList(result?.data?.docs)
        }
        setLoading(false)
      } catch (error) {}
    },
    [isEnabled, filterPortfolioType, filterReturnType, activeKey, dispatch, walletAddress, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getPortfolioList(page)
    },
    [getPortfolioList]
  )

  function handleClick(id) {
    navigate(`/portfolioView?id=${id}`)
  }

  return (
    <div className="explorePage pt-40 pb-40">
      <Container>
        <div className="gx-xl-5">
          <Tab.Container
            id="coin_TableInner"
            activeKey={activeKey}
            defaultActiveKey={activeKey}
            onSelect={(e) => {
              setPortfolioList({})
              setActiveKey(e)
            }}
          >
            <div className="commonTopbar d-md-flex align-items-center justify-content-between mobileHeight">
              <Nav className="tab_sec Border_Tabs">
                <Nav.Item>
                  <Nav.Link eventKey="allFunds">All Portfolios</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="portfolio">My Portfolio</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="myFunds">Customized Portfolios</Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="d-sm-flex align-items-center">
                <div className="exploreSwitch mt-4 my-sm-0">
                  <p>Show Enable/Disable</p>
                  <Switch onChange={setEnableDisable} checked={isEnabled} />
                </div>
                <div className="exploreFilter ms-sm-4 my-4 my-sm-0">
                  <CustomDropdown
                    onSelect={(e: any) => setFilterPortfolioType(e.value)}
                    options={filterOptionsForType}
                    placeholder="Portfolio Type"
                    icon={<FilterIcon />}
                  />
                </div>
                <div className="exploreFilter ms-sm-4 my-4 my-sm-0">
                  <CustomDropdown
                    onSelect={(e: any) => setFilterReturnType(e.value)}
                    options={filterOptionsForReturns}
                    placeholder="Returns Type"
                    icon={<FilterIcon />}
                  />
                </div>
              </div>
            </div>
            <Tab.Content>
              <Tab.Pane eventKey="allFunds">
                {activeKey === 'allFunds' && (
                  <div className="managePortfolio_Box">
                    <Row className="gx-xl-5">
                      {portfolioList?.length ? (
                        portfolioList?.map((portfolioListItem: any) => {
                          return (
                            <Col key={portfolioListItem?.portfolioId} xs={12} md={6} xxl={4} className="mb-4 mb-xl-5">
                              <ManageCard
                                addClass={addClass[portfolioListItem?.portfolioType]}
                                portfolioId={portfolioListItem?.portfolioId}
                                ticker={portfolioListItem?.portfolioTicker}
                                heading={portfolioListItem?.portfolioName}
                                asset={portfolioListItem?.currencies}
                                returns={portfolioListItem?.expectedReturns}
                                fees={portfolioListItem?.aumFees}
                                onClick={() => handleClick(portfolioListItem?.portfolioId)}
                                getPortfolioList={getPortfolioList}
                              />
                            </Col>
                          )
                        })
                      ) : (
                        <NoRecord text="Portfolios" loading={loading} shimmerType="card" />
                      )}
                      {totalData > CARDLIMIT && (
                        <Pagination
                          totalRecords={totalData}
                          pageLimit={CARDLIMIT}
                          pageNeighbours={2}
                          onPageChanged={onPageChanged}
                          currentPage={currentPage}
                          totalPage={totalPage}
                          className="justify-content-end"
                        />
                      )}
                    </Row>
                  </div>
                )}
              </Tab.Pane>
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
              </Tab.Pane>
              <Tab.Pane eventKey="myFunds">
                {activeKey === 'myFunds' && (
                  <div className="managePortfolio_Box">
                    <Row className="gx-xl-5">
                      {portfolioList?.length ? (
                        portfolioList?.map((item: any, index) => {
                          return (
                            <Col key={item?.portfolioId} xs={12} md={6} xxl={4} className="mb-4 mb-xl-5">
                              <ManageCard
                                addClass={addClass[item?.portfolioType]}
                                portfolioId={item?.portfolioId}
                                portfolioType={item?.portfolioType}
                                ticker={item?.portfolioTicker}
                                heading={item?.portfolioName}
                                asset={item?.currencies}
                                returns={item?.expectedReturns}
                                fees={item?.aumFees}
                                onClick={() => handleClick(item?.portfolioId)}
                                getPortfolioList={getPortfolioList}
                                Listdropdown={false}
                                options={options}
                                defaultOption={item?.isList === true ? options[0] : options[1]}
                                deleteicon={item?.portfolioType !== PORTFOLIO_TYPE.legacy}
                                editicon={item?.portfolioType !== PORTFOLIO_TYPE.legacy}
                                isEnabled={item?.isEnable}
                                isList={item?.isList}
                              />
                            </Col>
                          )
                        })
                      ) : (
                        <NoRecord text="Portfolios" loading={loading} shimmerType="card" />
                      )}
                      {totalData > CARDLIMIT && (
                        <Pagination
                          totalRecords={totalData}
                          pageLimit={CARDLIMIT}
                          pageNeighbours={2}
                          onPageChanged={onPageChanged}
                          currentPage={currentPage}
                          totalPage={totalPage}
                          className="justify-content-end"
                        />
                      )}
                    </Row>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </Container>
      <RestrictionModal show={showDisclaimer} handleClose={handleDisclaimerClose} heading="Regulation">
        <p className="custom-p">
          Due to regulatory and compliance, any resident residing within the USA are restricted from access.
        </p>
      </RestrictionModal>
    </div>
  )
}

export default Explore
