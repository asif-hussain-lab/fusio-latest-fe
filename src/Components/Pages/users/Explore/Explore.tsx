import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Col, Container, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { COUNTRY_TO_RESTRICT, PORTFOLIO_TYPE, RETURNS_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from '../../../../Utils/Utils'
import CustomDropdown from '../../../Common/CustomDropdown/CustomDropdown'
import Switch from '../../../Common/FormInputs/Switch'
import ManageCard from '../../../Common/ManageCard/ManageCard'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import Pagination from '../../../Common/Paginations/Paginations'
import './Explore.scss'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'
import InputCustom from '../../../Common/Inputs/InputCustom'

const Explore = () => {
  const navigate = useNavigate()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const country = useSelector((state: any) => state.user.country)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [portfolioList, setPortfolioList] = useState<any>()
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [filterPortfolioType, setFilterPortfolioType] = useState<any>('')
  const [filterPortfolioSearch, setFilterPortfolioSearch] = useState<string>('')
  const [filterReturnType, setFilterReturnType] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [activeKey, setActiveKey] = useState<any>('')
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const prevRefreshUserData = useRef(refreshUserData)
  const filterOptionsForType = useMemo(() => TYPE_FILTER_OPTIONS, [])
  const filterOptionsForReturns = useMemo(() => RETURNS_FILTER_OPTIONS, [])
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
    1: 'gradientbox3',
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
  }, [isEnabled, filterPortfolioType,filterPortfolioSearch, filterReturnType, activeKey, walletAddress, refreshUserData])

  const setEnableDisable = () => {
    if (isEnabled) {
      setIsEnabled(false)
    } else {
      setIsEnabled(true)
    }
  }

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
          search?: string
          user?: string
        } = {
          page: page,
          limit: 9,
          isEnable: isEnabled,
          user: walletAddress,
        }

        if (filterPortfolioType) {
          obj.portfolioType = filterPortfolioType
        }

        if (filterPortfolioSearch) {
          obj.search = filterPortfolioSearch
          console.log(filterPortfolioSearch)
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
      } catch (error) { }
    },
    [isEnabled, filterPortfolioType,filterPortfolioSearch, filterReturnType, activeKey, dispatch, walletAddress, refreshUserData]
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
                  <Nav.Link eventKey="myFunds">Customized Portfolios</Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="d-sm-flex align-items-center">
                <div className="exploreSwitch mt-4 my-sm-0">
                  <p>Show Enable/Disable</p>
                  <Switch onChange={setEnableDisable} checked={isEnabled} />
                </div>
                <div className="exploreSwitch ms-sm-4 mt-4 my-sm-0" style={{width:'32rem'}}>
                <input
                  id="search"
                  name="search"
                  className='custom-search-input'
                  placeholder="Search by Portfolio Name, Ticker, or Fee"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") { // Only update when Enter is pressed
                      setFilterPortfolioSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
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
                            <Col key={portfolioListItem?.portfolioId} xs={12} md={4} xxl={4} className="mb-4 mb-xl-5">
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
                      {totalData > 9 && (
                        <Pagination
                          totalRecords={totalData}
                          pageLimit={9}
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
                      {totalData > 9 && (
                        <Pagination
                          totalRecords={totalData}
                          pageLimit={9}
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
      
    </div>
  )
}

export default Explore
