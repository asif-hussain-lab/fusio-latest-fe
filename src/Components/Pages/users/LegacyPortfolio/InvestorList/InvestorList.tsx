import { Dispatch, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { callApiGetMethod } from '../../../../../Redux/Actions/api.action'
import { TABLELIMIT } from '../../../../../Utils/Utils'
import CommonTable from '../../../../Common/CommonTable/CommonTable'
import CopyAddress from '../../../../Common/CopyAddress/CopyAddress'
import Pagination from '../../../../Common/Paginations/Paginations'
import './InvestorList.scss'

const InvestorList = ({ id }: { id: string }) => {
  const dispatch: Dispatch<any> = useDispatch()
  const [investors, setInvestors] = useState<any>([])
  const [loading, setLoading] = useState<any>(true)
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalData, setTotalData] = useState<any>(0)
  const fields = ['Sr No', 'Wallet Address']

  const getInvestors = useCallback(async (page: number = 1) => {
    let params: { page: number; limit: number; id?: string } = {
      page: page,
      limit: TABLELIMIT,
    }
    if (id) params.id = id
    let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_INVESTORS_LIST', params, false))
    if (result?.success) {
      setTotalPage(result?.data?.totalPages)
      setCurrentPage(page)
      setTotalData(result?.data?.totalDocs)
      setInvestors(result?.data?.docs)
    }
    setLoading(false)
  }, [dispatch, id])

  useEffect(() => {
    id && getInvestors()
  }, [getInvestors, id])

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getInvestors(page)
    },
    [getInvestors]
  )

  return (
    <div className="investorList">
      <h3>Investors</h3>
      <CommonTable fields={fields} loading={loading}>
        {investors?.map((item: any, index: number) => (
          <tr key={item?.portfolioId}>
            <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
            <td>
              <CopyAddress text={item?.user} />
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
export default InvestorList
