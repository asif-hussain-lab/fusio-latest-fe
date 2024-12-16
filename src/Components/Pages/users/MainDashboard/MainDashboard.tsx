  import moment from 'moment'
  import { Dispatch, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
  import cardBg from '../../../../Assets/Images/exploreCardBg.png'
import { Col, Container, Row, Card } from 'react-bootstrap' 
  import { useDispatch, useSelector } from 'react-redux'
  import { NavLink, useSearchParams } from 'react-router-dom'
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

const MainDashboard = () => {
    
  const steps = [
    {
      title: 'Connect Wallet:',
      description:
        'Connect existing DEX wallet at the top right, or create a new one by clicking on your wallet of choice.',
      image: '🔗', // Replace with actual image
    },
    {
      title: 'Select Portfolio:',
      description:
        'Explore curated portfolios, select the one according to your risk endurance.',
      image: '💼', // Replace with actual image
    },
    {
      title: 'Confirm Investment:',
      description:
        'Enter investment amount, as less as $10. Click on invest.',
      image: '✅', // Replace with actual image
    },
    {
      title: 'Check Growth:',
      description: "See your investment growing in 'my portfolio'.",
      image: '📈', // Replace with actual image
    },
    {
      title: 'Rebalance Requests:',
      description:
        'Approve rebalance requests to update your portfolios according to the fund manager’s changing asset allocation.',
      image: '🔄', // Replace with actual image
    },
  ];
    return (
      <div className="commonContentModal pt-40 pb-40">
        <Container>
          <div className="fundForm commonBasecard mrq">
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
                    A simple to use platform for both new and experienced crypto investors to create their own
                    diversified
                    <br />
                    portfolios or invest in a curated one.
                  </h6>
                </div>
              </div>
            </div>

            {/* <Row>
              <Col xs={5}>
                <h4>Market Trend</h4>
                <div className="coinListD">
                  <div className="coinList_listBox">
                    <Row>
                      <Col xs={6}>
                        <div className="CoinList_card">
                          <div className="coin_info">
                            <img src={BNB} alt="Currency-Logo" className="currencyLogo" />
                            <h6>BNB</h6>
                            <h6>100%</h6>
                          </div>
                          <div className="coin_info">
                            <PercentageChange
                              changeStatus="up"
                              percentageChange="2.5"
                              toolTipText="Changes in last 1 hour"
                            />
                          </div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="CoinList_card">
                          <div className="coin_info">
                            <img src={BNB} alt="Currency-Logo" className="currencyLogo" />
                            <h6>BNB</h6>
                            <h6>100%</h6>
                          </div>
                          <div className="coin_info">
                            <PercentageChange
                              changeStatus="up"
                              percentageChange="2.5"
                              toolTipText="Changes in last 1 hour"
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={6}>
                        <div className="CoinList_card">
                          <div className="coin_info">
                            <img src={BNB} alt="Currency-Logo" className="currencyLogo" />
                            <h6>BNB</h6>
                            <h6>100%</h6>
                          </div>
                          <div className="coin_info">
                            <PercentageChange
                              changeStatus="up"
                              percentageChange="2.5"
                              toolTipText="Changes in last 1 hour"
                            />
                          </div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="CoinList_card">
                          <div className="coin_info">
                            <img src={BNB} alt="Currency-Logo" className="currencyLogo" />
                            <h6>BNB</h6>
                            <h6>100%</h6>
                          </div>
                          <div className="coin_info">
                            <PercentageChange
                              changeStatus="up"
                              percentageChange="2.5"
                              toolTipText="Changes in last 1 hour"
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
              <Col xs={7}>
                <h4>Top Curated portfolios</h4>
                <Card className="cardCustom">
                  <Row className="g-4 justify-content-center">
                    {steps.map((step, index) => (
                      <Col xs={4} md={3} lg={2} key={index} className='border-0'>
                        <Card className="h-100 shadow-sm text-center p-3">
                          <div className="step-icon mb-3 display-4">{step.image}</div>
                          <Card.Body>
                            <Card.Title className="fw-bold mb-2">{step.title}</Card.Title>
                            <Card.Text className="text-muted">{step.description}</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="text-center mt-4">
                    <p>
                      Don't want to invest in a curated portfolio?{' '}
                      <a href="/create-own" className="fw-bold text-primary">
                        Create your own
                      </a>
                    </p>
                  </div>
                </Card>
              </Col>
            </Row> */}
          </div>
        </Container>
      </div>
    )
  }

  export default memo(MainDashboard)
