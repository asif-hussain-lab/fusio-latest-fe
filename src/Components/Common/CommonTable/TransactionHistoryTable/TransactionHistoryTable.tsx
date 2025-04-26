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
import { saveAs } from 'file-saver'
import './TransactionHistoryTable.scss'

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

  const generateCSV = useCallback(async () => {
    const getAllTransactionsForCSV = async () => {
      let obj: { page: number; limit?: number; user?: string } = {
        page: 1, // Start from the first page
        limit: 1000, // Fetch all transactions without any limit
      };
      if (isAdmin && props?.selectedUser) {
        obj.user = props?.selectedUser;
      } else if (!props?.all) {
        obj.user = walletAddress;
      }
  
      try {
        const result: any = await dispatch(callApiGetMethod('GET_USER_TRANSACTIONS', obj, false));
        if (result?.success) {
          console.log(result?.data)
          return result?.data?.docs || []; // Return the transactions

        }
        console.error('Failed to fetch all transactions for CSV');
        return [];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    };
  
    const allTransactions = await getAllTransactionsForCSV();
    if (!allTransactions || allTransactions.length === 0) {
      console.error('No transaction data available to download.');
      return;
    }
  
    console.log(allTransactions);
    const headers = ['Transaction ID', 'User', 'Amount', 'Date']; // Adjust headers as per your data structure
    const rows = allTransactions.map((transaction: any) => ({
      portfolioName: transaction.portfolioName || 'N/A',
      transactionHash: transaction.transactionHash || 'N/A',
      user: transaction.user,
      amount: transaction?.event === TRANSACTION_STATUS.CLAIMED
        ? `${divideBigNumber(transaction?.amount?.$numberDecimal, tokenDecimals)} ${tokenSymbol}`
        : `${divideBigNumber(transaction?.buyAmount?.$numberDecimal, tokenDecimals)} ${tokenSymbol}` || '0' + tokenSymbol,
      date: transaction.date || 'N/A',
      fee: divideBigNumber(
        transaction?.adminAumFees?.$numberDecimal ? transaction.adminAumFees?.$numberDecimal : '0',
        tokenDecimals,
        false
      ) + ' ' + tokenSymbol,
      createDate: transaction?.time
        ? moment(transaction?.time * 1000).format('DD-MM-YYYY hh:mm A')
        : moment(transaction?.createdAt).format('DD-MM-YYYY hh:mm A'),
      event: transaction?.event,
    }));
  
    const csvContent =
      [headers.join(',')]
        .concat(rows.map((row) => Object.values(row).join(',')))
        .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'AllTransactions.csv');
  },[]);
  

  return (
    <div className="transactionHistoryTable">
      <div className="d-sm-flex align-items-start justify-content-between mb-4 mb-md-4">
        {/* <h5 style={{color:'black', paddingTop:'14px'}}>Transaction History</h5> */}
        <button className="btn-style" onClick={generateCSV}>
          <span className="iconSpace">
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.6993 13.6208V15.8109H2.36857V13.6208H0.178467V16.906C0.178467 17.1964 0.293838 17.4749 0.4992 17.6803C0.704562 17.8857 0.983093 18.001 1.27352 18.001H18.7943C19.0848 18.001 19.3633 17.8857 19.5687 17.6803C19.774 17.4749 19.8894 17.1964 19.8894 16.906V13.6208H17.6993ZM14.4141 4.91903L10.0339 0.538818L5.65373 4.91903L7.2087 6.474L8.93888 4.73287V13.6794H11.129V4.73287L12.8701 6.474L14.4141 4.91903Z"
                fill="#FFFFFF"
              ></path>
            </svg>
          </span>
          Data Export
        </button>
      </div>
      <div className='tableFormat'>
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
    </div>
  )
}

export default TransactionHistoryTable
