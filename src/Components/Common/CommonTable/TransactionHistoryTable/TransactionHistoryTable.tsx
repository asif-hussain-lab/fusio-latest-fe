import moment from 'moment'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { LinkIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { customizeAddress, divideBigNumber, renderTransactionStatusClassName } from '../../../../Services/common.service'
import { CARDLIMIT, TABLELIMIT, TRANSACTION_STATUS } from '../../../../Utils/Utils'
import CopyAddress from '../../CopyAddress/CopyAddress'
import Pagination from '../../Paginations/Paginations'
import CommonTable from '../CommonTable'

const TransactionHistoryTable = (props: {
  selectedUser?: string
  all?: boolean
}) => {
  const fields1 = [
    'Sr No',
    'Portfolio',
    'Transaction Hash',
    'Wallet Address',
    'Amount',
    'Transaction Fees',
    'Date',
    'Action',
  ]
  const fields2 = ['Sr No', 'Portfolio', 'Transaction Hash', 'Amount', 'Transaction Fees', 'Date', 'Action']

  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const isAdmin = useSelector((state: any) => state.admin.isAdmin)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [transactionsList, setTransactionsList] = useState<any>()
  const [totalPage, setTotalPage] = useState<any>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const prevRefreshUserData = useRef(refreshUserData)

  useEffect(() => {
    if (walletAddress) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getTransactions(currentPage, false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getTransactions()
      }
    } else {
      setLoading(false)
      setTransactionsList([])
    }
  }, [walletAddress, props?.selectedUser, refreshUserData])

  const getTransactions = useCallback(
    async (page: number = 1, loading = true) => {
      let obj: { page: number; limit?: number; user?: string } = {
        page: page,
        limit: TABLELIMIT,
      }
      if (isAdmin && props?.selectedUser) {
        obj.user = props?.selectedUser
        obj.limit = CARDLIMIT
      } else if (!props?.all) {
        obj.user = walletAddress
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_USER_TRANSACTIONS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setTransactionsList(result?.data?.docs)
      }
      setLoading(false)
    },
    [isAdmin, props?.selectedUser, props?.all, walletAddress, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getTransactions(page)
    },
    [getTransactions]
  )

  return (
    <div className="transactionHistoryTable">
      <CommonTable fields={props?.selectedUser ? fields2 : fields1} loading={loading}>
        {transactionsList?.map((item: any, index: number) => (
          <tr key={item?.createdAt}>
            {isAdmin && props?.selectedUser ? (
              <td>{index + 1 + (currentPage - 1) * CARDLIMIT}</td>
            ) : (
              <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
            )}
            <td>
              {props?.all || props?.selectedUser ? (
                <Link to={`/admin/portfolioView?id=${item?.portfolioId}`} className="currencyAddress">
                  {item.portfolioName}
                </Link>
              ) : (
                <Link to={`/portfolioView?id=${item?.portfolioId}`} className="currencyAddress">
                  {item.portfolioName}
                </Link>
              )}
            </td>
            <td>
              {item?.transactionHash ? (
                <a href={item?.transactionHash} target="_blank" rel="noreferrer" className="currencyAddress">
                  {customizeAddress(item.transactionHash.split('/')[4])}
                  <span className="svgicon ms-2">
                    <LinkIcon />
                  </span>
                </a>
              ) : (
                '-'
              )}
            </td>
            {!props?.selectedUser && (
              <td>
                <CopyAddress text={item?.user} />
              </td>
            )}
            <td>
              {item?.event === TRANSACTION_STATUS.CLAIMED
                ? `${divideBigNumber(item?.amount?.$numberDecimal, tokenDecimals)} ${tokenSymbol}`
                : `${divideBigNumber(item?.buyAmount?.$numberDecimal, tokenDecimals)} ${tokenSymbol}`}
            </td>
            <td>
              {divideBigNumber(
                item?.adminAumFees?.$numberDecimal ? item.adminAumFees?.$numberDecimal : '0',
                tokenDecimals,
                false
              )}{' '}
              {tokenSymbol}
            </td>
            <td>
              {item?.time
                ? moment(item?.time * 1000).format('DD-MM-YYYY hh:mm A')
                : moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}
            </td>
            <td className={renderTransactionStatusClassName(item?.event)}>{item?.event}</td>
          </tr>
        ))}
      </CommonTable>

      {isAdmin && props?.selectedUser && totalData > CARDLIMIT && (
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
      {(!isAdmin || !props?.selectedUser) && totalData > TABLELIMIT && (
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
    </div>
  )
}

export default TransactionHistoryTable
