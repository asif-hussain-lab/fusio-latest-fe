import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { CARDLIMIT } from '../../../../Utils/Utils'
import NftCard from '../../../Common/NftCard/NftCard'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import Pagination from '../../../Common/Paginations/Paginations'
import { callContractGetMethod } from '../../../../Redux/Actions/contract.action'

function MyNftPage() {
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [mynftData, setMynftData] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<any>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [rebalnceMyPortfolioFee, setRebalnceMyPortfolioFee] = useState<any>('')
  const dispatch: Dispatch<any> = useDispatch()
  const prevRefreshUserData = useRef(refreshUserData)

  useEffect(() => {
    if (walletAddress) {
      if (prevRefreshUserData.current !== refreshUserData) {
        getMynftList(currentPage, false)
        prevRefreshUserData.current = refreshUserData
      } else {
        getMynftList()
      }
    } else {
      setLoading(false)
      setMynftData('')
    }
    getRebalnceMyPortfolioFee()
  }, [walletAddress, refreshUserData])

  const getRebalnceMyPortfolioFee = async () => {
    let result: any = await dispatch(
      callContractGetMethod('reBalancesMyPortfolioMinimumAmount', [], 'portfolio', false)
    )
    if (result) {
      setRebalnceMyPortfolioFee(result)
    }
  }

  const getMynftList = useCallback(
    async (page: number = 1, loading = true) => {
      const obj: { page: number; limit: number; user?: string } = {
        page: page,
        limit: CARDLIMIT,
        user: walletAddress,
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_NFT_DETAILS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setMynftData(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch, walletAddress, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getMynftList(page)
    },
    [getMynftList]
  )

  return (
    <div>
      <Row className="gx-xl-5">
        {mynftData.length > 0 ? (
          mynftData.map((item: any) => (
            <Col className="d-flex mb-4 mb-md-4 md-6" xs={12} md={6} xxl={4} key={item.nftId}>
              <NftCard
                className="nftclrCard w-100"
                item={item}
                rebalnceMyPortfolioFee={rebalnceMyPortfolioFee}
                isNftCard
              />
            </Col>
          ))
        ) : (
          <NoRecord loading={loading} text="Portfolios" shimmerType="card" />
        )}
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
      </Row>
    </div>
  )
}

export default MyNftPage
