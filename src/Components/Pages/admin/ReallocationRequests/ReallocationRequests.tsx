import moment from 'moment'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { renderReallocationStatusClassName } from '../../../../Services/common.service'
import { TABLELIMIT } from '../../../../Utils/Utils'
import { RebalancingPortfolioModal } from '../../../Common/CommonModal/RebalancingPortfolioModal/RebalancingPortfolioModal'
import CommonTable from '../../../Common/CommonTable/CommonTable'
import CopyAddress from '../../../Common/CopyAddress/CopyAddress'
import Pagination from '../../../Common/Paginations/Paginations'
import './ReallocationRequests.scss'

const ReallocationRequests = () => {
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const fields = ['Sr No', 'Portfolio Name', 'Expected Returns', 'Created By', 'Created At', 'Status', 'Action']
  const [show, setShow] = useState<boolean>(false)
  const handleClose = () => setShow(false)
  const [rebalancingRequests, setRebalancingRequests] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<any>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [requestId, setRequestId] = useState<any>()
  const prevRefreshUserData = useRef(refreshUserData)
  const dispatch: Dispatch<any> = useDispatch()

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      getRebalancingRequests(currentPage, false)
      prevRefreshUserData.current = refreshUserData
    } else {
      getRebalancingRequests()
    }
  }, [refreshUserData])

  const getRebalancingRequests = useCallback(
    async (page: number = 1, loading: boolean = true) => {
      const obj: { page: number; limit: number; search?: string } = {
        page: page,
        limit: TABLELIMIT,
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_REALLOCATION_REQUESTS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setRebalancingRequests(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getRebalancingRequests(page)
    },
    [getRebalancingRequests]
  )

  return (
    <div className="rebalancing">
      <CommonTable fields={fields} loading={loading}>
        {rebalancingRequests?.map((item: any, index: number) => (
          <tr key={item?.createdAt}>
            <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
            <td>
              <Link to={`/admin/portfolioView?id=${item?.portfolioId}`}>{item?.portfolioName}</Link>
            </td>
            <td>{item?.expectedReturns}</td>
            <td>
              <CopyAddress text={item?.user} />
            </td>
            <td>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
            <td className={renderReallocationStatusClassName(item?.status)}>{item?.status}</td>
            <td>
              <button
                type="button"
                className="viewbtn"
                onClick={() => {
                  setShow(true)
                  setRequestId(item?._id)
                }}
              >
                View
              </button>
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
      <RebalancingPortfolioModal show={show} handleClose={handleClose} requestId={requestId} />
    </div>
  )
}

export default ReallocationRequests
