import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import TimeAgo from 'react-timeago'
import { NotificationIcon, NotificationIconDark } from '../../../Assets/Images/Icons/SvgIcons'
import { callApiGetMethod, callApiPostMethod } from '../../../Redux/Actions/api.action'
import NoRecord from '../NoRecord/NoRecord'
import { useTheme } from '../../../Utils/ThemeContext'

const Notification = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const navigate = useNavigate()
  const [notificationList, setNotificationList] = useState<any>([])
  const [count, setCount] = useState<number>(0)
  const [show, setShow] = useState<boolean>(false)
  const prevRefreshUserData = useRef(refreshUserData)

  const getNotificationCount = useCallback(async () => {
    let result: any = await dispatch(callApiGetMethod('GET_NOTIFICATION_COUNT', { user: walletAddress }, false))
    setCount(result?.data)
  }, [walletAddress, refreshUserData])

  const getNotificationList = useCallback(
    async (loading: boolean = false) => {
      setLoading(true)
      let result: any = await dispatch(
        callApiGetMethod(
          'GET_NOTIFICATION_LIST',
          {
            user: walletAddress,
          },
          false
        )
      )
      if (result?.success) {
        setNotificationList(result.data?.docs)
        callReadNotification()
      }
      setLoading(false)
    },
    [show, walletAddress, refreshUserData, dispatch]
  )

  const callReadNotification = async () => {
    const res: any = await dispatch(
      callApiPostMethod(
        'READ_NOTIFICATION',
        {},
        {
          user: walletAddress,
        },
        false,
        false
      )
    )
    if (res) {
      getNotificationCount()
    }
  }
  useEffect(() => {
    if (walletAddress) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getNotificationCount()
        prevRefreshUserData.current = refreshUserData
      } else {
        getNotificationCount()
      }
    } else {
      setLoading(false)
      setCount(0)
    }
  }, [walletAddress, refreshUserData])

  useEffect(() => {
    if (walletAddress && show) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getNotificationList(false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getNotificationList()
      }
    } else {
      setLoading(false)
      show && setNotificationList([])
    }
  }, [show, walletAddress, refreshUserData])

  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Dropdown align="end" className="notification">
        <Dropdown.Toggle variant="" id="dropdown-basic">
            <div className="bellIcon" onClick={() => setShow(true)}>
              {count > 0 && <span>{count}</span>}
              <div>
                {theme === 'dark' ? <NotificationIconDark /> : <NotificationIcon />}
              </div>
            </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="dropmsg">
            <div className="d-flex justify-content-between align-items-center ">
              <h5>Notification</h5>
              <Dropdown.Item className="linkText w-auto">
                {notificationList?.length > 0 && (
                  <span
                    onClick={() => {
                      navigate('/notification')
                    }}
                  >
                    View All
                  </span>
                )}
              </Dropdown.Item>
            </div>
            <ul className="listNoti">
              {notificationList?.length > 0 ? (
                notificationList?.map((item: any) => (
                  <li key={item?._id}>
                    <div className="msgInfo">
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
                        <span className="time">
                          <TimeAgo date={item?.createdAt} />
                        </span>
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <NoRecord loading={loading} text="Notification" shimmerType="loader" />
              )}
            </ul>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default Notification
