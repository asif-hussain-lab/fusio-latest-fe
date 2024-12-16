/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable no-loop-func */
import { Dispatch, useEffect, useState } from 'react'
import { Col, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { UploadIcon } from '../../../../Assets/svgImgs/svgImgs'
import { openInNewTab } from '../../../../Redux/Actions/api.action'
import BarChart from '../../../Common/BarChart'
import CommonLink from '../../../Common/CommonLink/CommonLink'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import TransactionHistoryTable from '../../../Common/CommonTable/TransactionHistoryTable/TransactionHistoryTable'
import PieChart from '../../../Common/PieChart'
import StockChart from '../../../Common/StockChart'
import './IncomeAnalysis.scss'

const IncomeAnalysis = () => {
  const [activeKey, setActiveKey] = useState<any>('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showConfModal, setShowConfModal] = useState(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleConfModalShow = () => setShowConfModal(true)
  const dispatch: Dispatch<any> = useDispatch()

  useEffect(() => {
    activeKey && setSearchParams({ tab: activeKey })
  }, [activeKey])

  useEffect(() => {
    let activeTab = searchParams.get('tab')
    if (activeTab) {
      setActiveKey(activeTab)
    } else {
      setActiveKey('reportingandanalytics')
    }
  }, [searchParams])

  const exportData = async () => {
    handleConfModalClose()
    await dispatch(openInNewTab('EXPORT_TRANSACTIONS_DATA'))
  }

  return (
    <div className="coin_Table">
      <Tab.Container
        id="coin_TableInner"
        activeKey={activeKey}
        defaultActiveKey={activeKey}
        onSelect={(e) => {
          setActiveKey(e)
        }}
      >
        <div className="commonTopbar d-md-flex align-items-center justify-content-between">
          <Nav className="tab_sec Border_Tabs">
            <Nav.Item>
              <Nav.Link eventKey="reportingandanalytics">Reporting and Analytics</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="transactionhistory">Transaction History</Nav.Link>
            </Nav.Item>
          </Nav>
          {activeKey === 'transactionhistory' ? (
            <CommonLink
              icon={<UploadIcon />}
              text="Data Export and Backup "
              to={window.location.href}
              className="mt-3 mt-md-0 pb-3 pb-md-0"
              onClick={handleConfModalShow}
            />
          ) : (
            ''
          )}
        </div>
        <Tab.Content>
          <Tab.Pane eventKey="reportingandanalytics">
            {activeKey === 'reportingandanalytics' && (
              <Row>
                <Col xs={12} lg={7} xxl={8} className="d-flex flex-column">
                  <h5>Income from AUM Fees</h5>
                  <div className="mt-4">
                    <StockChart />
                  </div>
                </Col>
                <Col xs={12} lg={5} xxl={4} className="mt-4 mt-lg-0 d-flex flex-column">
                  <h5>Transaction Fee Portfolio Wise Analysis</h5>
                  <div className="commonBasecard mt-4 h-100">
                    <PieChart />
                  </div>
                </Col>
                <Col xs={12} className="mt-5">
                  <h5>Investment Trends</h5>
                  <div className="commonBasecard mt-4">
                    <BarChart />
                  </div>
                </Col>
              </Row>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="transactionhistory">
            {activeKey === 'transactionhistory' && <TransactionHistoryTable all={true} />}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      <ConfirmationModal
        text={`Are you sure you want to export data in csv file?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={exportData}
      />
    </div>
  )
}

export default IncomeAnalysis
