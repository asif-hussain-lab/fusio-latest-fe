import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import './NotificationView.scss'
import { Container } from 'react-bootstrap'
import { InvestorIcon } from '../../../../Assets/svgImgs/svgImgs'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { useNavigate } from 'react-router-dom'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import { CARDLIMIT } from '../../../../Utils/Utils'
import Pagination from '../../../Common/Paginations/Paginations'
import TimeAgo from 'react-timeago'

const NotificationView = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [notificationList, setNotificationList] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalData, setTotalData] = useState<any>(0)
  const navigate = useNavigate()
  const prevRefreshUserData = useRef(refreshUserData)

  const getNotificationList = useCallback(
    async (page: number = 1, loading: boolean = false) => {
      let obj: { page: number; limit: number; user?: string } = {
        page: page,
        limit: CARDLIMIT,
        user: walletAddress,
      }
      setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_NOTIFICATION_LIST', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setNotificationList(result.data?.docs)
      }
      setLoading(false)
    },
    [walletAddress, refreshUserData, dispatch]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getNotificationList(page)
    },
    [getNotificationList]
  )

  useEffect(() => {
    if (walletAddress) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getNotificationList(currentPage, false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getNotificationList()
      }
    } else {
      setLoading(false)
      setNotificationList([])
    }
  }, [walletAddress, refreshUserData])

  return (
    <>
      <div className="notificationView">
        <Container>
          <h2>All Notification</h2>

          <ul className="notificationView_notiList">
            {notificationList?.length > 0 ? (
              notificationList?.map((item, index: any) => {
                return (
                  <li key={index}>
                    <div className="noticontent">
                      <span className="token_icon">
                        <InvestorIcon />
                      </span>
                      <p>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item?.message,
                          }}
                        />
                        {item?.processId && (
                          <button
                            onClick={() => {
                              navigate(`/rebalancePortfolio?id=${item?.processId}`)
                            }}
                          >
                            view
                          </button>
                        )}
                      </p>
                    </div>
                    <p>
                      <TimeAgo date={item?.createdAt} />
                    </p>
                  </li>
                )
              })
            ) : (
              <NoRecord loading={loading} text="Notification" shimmerType="loader" />
            )}
          </ul>

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
        </Container>
      </div>
    </>
  )
}

export default NotificationView
