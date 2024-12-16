import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FilterIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { CARDLIMIT, PORTFOLIO_TYPE, TYPE_FILTER_OPTIONS } from '../../../../Utils/Utils'
import CommonLink from '../../../Common/CommonLink/CommonLink'
import CustomDropdown from '../../../Common/CustomDropdown/CustomDropdown'
import Switch from '../../../Common/FormInputs/Switch'
import ManageCard from '../../../Common/ManageCard/ManageCard'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import Pagination from '../../../Common/Paginations/Paginations'
import './ManagePortfolio.scss'

const ManagePortfolio = () => {
  const navigate = useNavigate()
  const dispatch: Dispatch<any> = useDispatch()
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [portfolioList, setPortfolioList] = useState<any>()
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterType, setFilterType] = useState<any>(0)
  const prevRefreshUserData = useRef(refreshUserData)

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      getPortfolioList(currentPage, false)
      prevRefreshUserData.current = refreshUserData
    } else {
      getPortfolioList()
    }
  }, [isEnabled, filterType, refreshUserData])

  const setEnableDisable = () => {
    if (isEnabled) {
      setIsEnabled(false)
    } else {
      setIsEnabled(true)
    }
  }

  const addClass = {
    2: 'gradientbox2',
    3: 'gradientbox1',
    4: 'gradientbox3',
  }
  const getPortfolioList = useCallback(
    async (page: number = 1, loading = true) => {
      const obj: { page: number; limit: number; isEnable?: boolean; portfolioType?: number } = {
        page: page,
        limit: CARDLIMIT,
        isEnable: isEnabled,
      }

      if (filterType) {
        obj.portfolioType = filterType
      }

      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_LIST', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setPortfolioList(result?.data?.docs)
      }
      setLoading(false)
    },
    [isEnabled, filterType, dispatch]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getPortfolioList(page)
    },
    [getPortfolioList]
  )
  function handleClick(id) {
    navigate(`/admin/portfolioView?id=${id}`)
  }

  return (
    <>
      <div className="managePortfolio">
        <div className="commonTopbar p-4 px-md-5 d-md-flex align-items-center justify-content-between">
          <h6>Manage Portfolio</h6>
          <div className="d-sm-flex align-items-center">
            <div className="exploreSwitch mt-4 my-sm-0 mx-2">
              <p>Show Enable/Disable</p>
              <Switch onChange={setEnableDisable} checked={isEnabled} />
            </div>
            <div className="exploreFilter mx-4 ms-sm-4 my-4 my-sm-0">
              <CustomDropdown
                onSelect={(e: any) => setFilterType(e.value)}
                options={TYPE_FILTER_OPTIONS}
                placeholder="All"
                icon={<FilterIcon />}
              />
            </div>
            <CommonLink
              text="Add New Portfolio"
              to={`/admin/portfolio/manage-portfolio/addPortfolio?type=${PORTFOLIO_TYPE.legacy}`}
              className="mt-3 mt-md-0 pb-3 pb-md-0"
            />
          </div>
        </div>
        <div className="managePortfolio_Box">
          <Row className="gx-xl-5">
            {portfolioList?.length ? (
              portfolioList?.map((portfolioListItem: any) => {
                return (
                  <Col key={portfolioListItem?.portfolioId} xs={12} md={6} xxl={4} className="mb-4 mb-xl-5 max-width">
                    <ManageCard
                      addClass={addClass[portfolioListItem?.portfolioType]}
                      portfolioType={portfolioListItem?.portfolioType}
                      portfolioId={portfolioListItem?.portfolioId}
                      ticker={portfolioListItem?.portfolioTicker}
                      heading={portfolioListItem?.portfolioName}
                      asset={portfolioListItem?.currencies}
                      cate={portfolioListItem?.currencies}
                      fees={portfolioListItem?.aumFees}
                      isEnabled={portfolioListItem?.isEnable}
                      deleteicon={portfolioListItem?.portfolioType === PORTFOLIO_TYPE.legacy}
                      editicon={portfolioListItem?.portfolioType === PORTFOLIO_TYPE.legacy}
                      getPortfolioList={getPortfolioList}
                      onClick={() => handleClick(portfolioListItem?.portfolioId)}
                      admin
                    />
                  </Col>
                )
              })
            ) : (
              <NoRecord text="Portfolios" loading={loading} shimmerType="card" />
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
      </div>
    </>
  )
}

export default ManagePortfolio
