import { Dispatch, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { LinkIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { customizeAddress, renderNftStatusClassName } from '../../../../Services/common.service'
import { NFT_STATUS, TABLELIMIT } from '../../../../Utils/Utils'
import CommonTable from '../../../Common/CommonTable/CommonTable'
import CopyAddress from '../../../Common/CopyAddress/CopyAddress'
import Pagination from '../../../Common/Paginations/Paginations'
import './NFTManagement.scss'

const NFTManagement = () => {
  const fields = [
    'Sr No',
    'Portfolio Name',
    'NFT ID',
    'USD Value',
    'Wallet ID',
    'NFT Transfer Hash',
    'NFT Status',
    'Action',
  ]
  const [mynftData, setMynftData] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch: Dispatch<any> = useDispatch()

  useEffect(() => {
    getMynftList()
  }, [])

  const getMynftList = useCallback(async (page: number = 1) => {
    const obj: { page: number; limit: number; search?: string } = {
      page: page,
      limit: TABLELIMIT,
    }
    setLoading(true)
    let result: any = await dispatch(callApiGetMethod('GET_ADMIN_NFT_DETAILS', obj, false))
    if (result?.success) {
      setTotalPage(result?.data?.totalPages)
      setCurrentPage(page)
      setTotalData(result?.data?.totalDocs)
      setMynftData(result?.data?.docs)
    }
    setLoading(false)
  }, [dispatch])

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getMynftList(page)
    },
    [getMynftList]
  )

  return (
    <div className="nftManagement">
      <h5 className="mb-4 pb-2 pb-md-3">BGF Metadata Management</h5>
      <CommonTable fields={fields} loading={loading}>
        {mynftData?.map((item: any, index: number) => (
          <tr key={item?.time}>
            <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
            <td>
              <Link to={`/admin/portfolioView?id=${item?.portfolioId}`}>{item?.portfolioName}</Link>
            </td>
            <td>{item?.nftId}</td>
            <td>${item?.usdValue}</td>
            <td>
              <CopyAddress text={item?.user} />
            </td>
            <td>
              {item?.transferredHash ? (
                <a href={item?.transferredHash} target="_blank" rel="noreferrer" className="currencyAddress">
                  {customizeAddress(item.transferredHash.split('/')[4])}
                  <span className="svgicon ms-2">
                    <LinkIcon />
                  </span>
                </a>
              ) : (
                '-'
              )}
            </td>
            <td className={renderNftStatusClassName(item?.status)}>{item?.status}</td>
            <td>
              {item?.status === NFT_STATUS.GENERATED || item?.status === NFT_STATUS.UPDATED ? (
                <a href={item?.viewUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              ) : (
                '-'
              )}
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
    </div>
  )
}

export default NFTManagement
