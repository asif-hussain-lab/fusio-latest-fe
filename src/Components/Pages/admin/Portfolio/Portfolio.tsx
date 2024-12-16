import { Dispatch, useCallback, useEffect, useState } from 'react'
import { Col, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { PFNAMELIMIT } from '../../../../Utils/Utils'
import CommonLink from '../../../Common/CommonLink/CommonLink'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import SelectDropdown from '../../../Common/SelectDropdown/SelectDropdown'
import Shimmer from '../../../Common/Shimmer/Shimmer'
import StockChart from '../../../Common/StockChart'
import InformationPanelCard from './InformationPanelCard/InformationPanelCard'
import './Portfolio.scss'

const Portfolio = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [portfolioList, setPortfolioList] = useState<any>([])
  const [activeKey, setActiveKey] = useState<any>()

  useEffect(() => {
    getPortfolioName()
  }, [])

  const getPortfolioName = useCallback(async () => {
    let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_NAMES', {}, false))
    if (result?.success) {
      setPortfolioList(result?.data)
      setActiveKey(result?.data[0]?.portfolioId)
    }
    setLoading(false)
  }, [dispatch])

  return (
    <div className="portFolio">
      {portfolioList?.length < PFNAMELIMIT ? (
        <>
          {' '}
          <Tab.Container
            id="coin_TableInner"
            activeKey={activeKey}
            defaultActiveKey={activeKey}
            onSelect={(e) => setActiveKey(e)}
          >
            <div className="commonTopbar d-md-flex align-items-center justify-content-between">
              <Nav className="tab_sec Border_Tabs">
                {portfolioList?.map((portfolioListItem: any) => {
                  return (
                    <Nav.Item key={portfolioListItem?.portfolioId}>
                      <Nav.Link eventKey={portfolioListItem?.portfolioId}>{portfolioListItem?.portfolioName}</Nav.Link>
                    </Nav.Item>
                  )
                })}
              </Nav>
              <CommonLink
                text="Manage Portfolio"
                to="/admin/portfolio/manage-portfolio"
                className="mt-3 mt-md-0 pb-3 pb-md-0"
              />
            </div>
          </Tab.Container>
          {portfolioList?.length ? (
            <Row className="gx-xl-5">
              <Col xs={12} lg={7} xl={8}>
                <h5>Portfolio Investment Trends</h5>
                <div className="tradeChart mt-4">
                  {activeKey ? (
                    <StockChart id={activeKey} priceType="yearly" />
                  ) : activeKey === undefined ? (
                    <StockChart />
                  ) : (
                    <Shimmer />
                  )}
                </div>
              </Col>
              <Col xs={12} lg={5} xl={4} className="mt-5 mt-lg-0">
                <InformationPanelCard portfolioId={activeKey} />
              </Col>
            </Row>
          ) : (
            <NoRecord text="Portfolios" loading={loading} shimmerType="table" />
          )}
        </>
      ) : (
        <>
          {' '}
          <div className="commonTopbar py-3 d-md-flex align-items-center justify-content-between">
            <div className="tab_sec">
              <SelectDropdown
                className="mb-0"
                data={selectedPortfolio}
                callback={setSelectedPortfolio}
                loader={setLoading}
                portfolioList={portfolioList}
              />
            </div>
            <CommonLink
              text="Manage Portfolio"
              to="/admin/portfolio/manage-portfolio"
              className="mt-3 mt-md-0 pb-3 pb-md-0"
            />
          </div>
          {selectedPortfolio ? (
            <Row className="gx-xl-5">
              <Col xs={12} lg={7} xl={8}>
                <h5>Portfolio Investment Trends</h5>
                <div className="tradeChart mt-4">
                  {selectedPortfolio ? (
                    <StockChart id={selectedPortfolio?.value?.portfolioId} priceType="yearly" />
                  ) : (
                    <Shimmer />
                  )}
                </div>
              </Col>
              <Col xs={12} lg={5} xl={4} className="mt-5 mt-lg-0">
                <InformationPanelCard portfolioId={selectedPortfolio?.value?.portfolioId} />
              </Col>
            </Row>
          ) : (
            <NoRecord text="Portfolios" loading={loading} shimmerType="table" />
          )}
        </>
      )}
    </div>
  )
}

export default Portfolio
