import moment from 'moment'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Container, Nav, Row, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { InfoIcon } from '../../../../Assets/Images/Icons/SvgIcons'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { divideBigNumber, renderOrderStatusClassName, renderRebalnceStatusClassName, renderRequestStatusClassName } from '../../../../Services/common.service'
import { ORDER_STATUS, REBALANCE_REQUEST_STATUS, TABLELIMIT, WITHDRAW_REQUEST_STATUS } from '../../../../Utils/Utils'
import CommonTable from '../../../Common/CommonTable/CommonTable'
import CopyAddress from '../../../Common/CopyAddress/CopyAddress'
import CustomTooltip from '../../../Common/CustomTooltip/CustomTooltip'
import Pagination from '../../../Common/Paginations/Paginations'
import './Orders.scss'

const Orders = () => {
  const orderfields = [
    'Sr No',
    'Portfolio Name',
    'Amount',
    'Ticker',
    'Wallet ID',
    'Expected Returns',
    'Order Time',
    'Status',
  ]
  const withdrawrequestsfields = [
    'Sr No',
    'Portfolio Name',
    'Claim Amount',
    'Percentage',
    'Wallet ID',
    'Order Time',
    'Claimed Time',
    'Status',
  ]
  const rebalanceequestsfields = ['Sr No', 'Portfolio Name', 'Expected Returns', 'Wallet ID', 'Order Time', 'Status']
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [data, setData] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<any>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch: Dispatch<any> = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeKey, setActiveKey] = useState<any>('')
  const prevRefreshUserData = useRef(refreshUserData)

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      activeKey === 'invest' && getMyOrderList(currentPage, false)
      activeKey === 'withdraw' && getWithdrawRequests(currentPage, false)
      activeKey === 'rebalance' && getRebalanceRequests(currentPage, false)
      prevRefreshUserData.current = refreshUserData
    } else {
      activeKey === 'invest' && getMyOrderList()
      activeKey === 'withdraw' && getWithdrawRequests()
      activeKey === 'rebalance' && getRebalanceRequests()
    }
  }, [refreshUserData, activeKey])

  useEffect(() => {
    activeKey && setSearchParams({ tab: activeKey })
  }, [activeKey])

  useEffect(() => {
    let activeTab = searchParams.get('tab')
    if (activeTab) {
      setActiveKey(activeTab)
    } else {
      setActiveKey('invest')
    }
  }, [searchParams])

  const getMyOrderList = useCallback(
    async (page: number = 1, loading: boolean = true) => {
      const obj: { page: number; limit: number; portfolioType?: number } = {
        page: page,
        limit: TABLELIMIT,
      }
      setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_ADMIN_ORDERS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setData(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch]
  )

  const getWithdrawRequests = useCallback(
    async (page: number = 1, loading: boolean = true) => {
      const obj: { page: number; limit: number; portfolioType?: number } = {
        page: page,
        limit: TABLELIMIT,
      }
      setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_ADMIN_WITHDRAW_REQUESTS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setData(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch]
  )

  const getRebalanceRequests = useCallback(
    async (page: number = 1, loading: boolean = true) => {
      const obj: { page: number; limit: number; portfolioType?: number } = {
        page: page,
        limit: TABLELIMIT,
      }
      setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_REBALANCE_REQUESTS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setData(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      activeKey === 'invest' && getMyOrderList(page)
      activeKey === 'withdraw' && getWithdrawRequests(page)
      activeKey === 'rebalance' && getRebalanceRequests(page)
    },
    [activeKey, getMyOrderList, getWithdrawRequests, getRebalanceRequests]
  )

  return (
    <div className="nftManagement">
      <Container>
        <Row className="gx-xl-5">
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
                  <Nav.Link eventKey="invest">Invest</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="withdraw">Withdraw</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rebalance">Rebalance</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            <Tab.Content className="px-0">
              <Tab.Pane eventKey="invest">
                {activeKey === 'invest' && (
                  <>
                    <CommonTable fields={orderfields} loading={loading}>
                      {data?.map((item: any, index: number) => (
                        <tr key={item?._id}>
                          <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
                          <td>
                            <Link to={`/admin/portfolioView?id=${item?.portfolioId}`}>{item?.portfolioName}</Link>
                          </td>
                          <td>
                            {divideBigNumber(item?.buyAmount?.$numberDecimal, tokenDecimals)} {tokenSymbol}
                          </td>
                          <td>{item?.portfolioTicker}</td>
                          <td>
                            <CopyAddress text={item?.user} />
                          </td>
                          <td>{item?.expectedReturns}</td>
                          <td>{moment(item?.time * 1000).format('DD-MM-YYYY hh:mm A')}</td>
                          <td className={renderOrderStatusClassName(item?.status)}>
                            <div className="d-flex">
                              {item?.status}{' '}
                              {item?.status === ORDER_STATUS.FAILED && (
                                <CustomTooltip className="ms-1" icon={<InfoIcon />} text={item?.result} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </CommonTable>
                    {totalData > TABLELIMIT && (
                      <Pagination
                        totalRecords={totalData}
                        pageLimit={TABLELIMIT}
                        pageNeighbours={2}
                        onPageChanged={onPageChanged}
                        currentPage={currentPage}
                        totalPage={totalPage}
                        className="justify-content-end"
                      />
                    )}
                  </>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="withdraw">
                {activeKey === 'withdraw' && (
                  <>
                    <CommonTable fields={withdrawrequestsfields} loading={loading}>
                      {data?.map((item: any, index: number) => (
                        <tr key={item?._id}>
                          <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
                          <td>
                            <Link to={`/admin/portfolioView?id=${item?.portfolioId}`}>{item?.portfolioName}</Link>
                          </td>
                          <td>
                            {divideBigNumber(item?.claimAmount?.$numberDecimal, tokenDecimals)} {tokenSymbol}
                          </td>
                          <td>{item?.percentage ? `${item?.percentage / 100}%` : '-'}</td>
                          <td>
                            <CopyAddress text={item?.user} />
                          </td>
                          <td>{moment(item?.time * 1000).format('DD-MM-YYYY hh:mm A')}</td>
                          <td>
                            {item?.claimedTime ? moment(item?.claimedTime * 1000).format('DD-MM-YYYY hh:mm A') : '-'}
                          </td>
                          <td className={`${renderRequestStatusClassName(item?.status)}`}>
                            <div className="d-flex">
                              {item?.status}{' '}
                              {item?.status === WITHDRAW_REQUEST_STATUS.FAILED && (
                                <CustomTooltip className="ms-1" icon={<InfoIcon />} text={item?.result} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </CommonTable>
                    {totalData > TABLELIMIT && (
                      <Pagination
                        totalRecords={totalData}
                        pageLimit={TABLELIMIT}
                        pageNeighbours={2}
                        onPageChanged={onPageChanged}
                        currentPage={currentPage}
                        totalPage={totalPage}
                        className="justify-content-end"
                      />
                    )}
                  </>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="rebalance">
                {activeKey === 'rebalance' && (
                  <>
                    <CommonTable fields={rebalanceequestsfields} loading={loading}>
                      {data?.map((item: any, index: number) => (
                        <tr key={item?._id}>
                          <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
                          <td>
                            <Link to={`/admin/portfolioView?id=${item?.portfolioId}`}>{item?.portfolioName}</Link>
                          </td>
                          <td>{item?.expectedReturns}</td>
                          <td>
                            <CopyAddress text={item?.user} />
                          </td>
                          <td>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                          <td className={`${renderRebalnceStatusClassName(item?.status)}`}>
                            <div className="d-flex">
                              {item?.status}{' '}
                              {item?.status === REBALANCE_REQUEST_STATUS.FAILED && (
                                <CustomTooltip className="ms-1" icon={<InfoIcon />} text={item?.result} />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </CommonTable>
                    {totalData > TABLELIMIT && (
                      <Pagination
                        totalRecords={totalData}
                        pageLimit={TABLELIMIT}
                        pageNeighbours={2}
                        onPageChanged={onPageChanged}
                        currentPage={currentPage}
                        totalPage={totalPage}
                        className="justify-content-end"
                      />
                    )}
                  </>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Row>
      </Container>
    </div>
  )
}

export default Orders
