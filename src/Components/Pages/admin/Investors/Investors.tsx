import { Dispatch, useCallback, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { UploadIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod, openInNewTab } from '../../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../../Services/common.service'
import { TABLELIMIT } from '../../../../Utils/Utils'
import useDebounce from '../../../../hooks/useDebounce'
import AssetBoxCard from '../../../Common/AssetBoxCard/AssetBoxCard'
import CommonButton from '../../../Common/Button/CommonButton'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import { PortfoliosNameModal } from '../../../Common/CommonModal/PortfoliosNameModal/PortfoliosNameModal'
import CommonSearch from '../../../Common/CommonSearch/CommonSearch'
import TransactionHistoryTable from '../../../Common/CommonTable/TransactionHistoryTable/TransactionHistoryTable'
import CopyAddress from '../../../Common/CopyAddress/CopyAddress'
import NoRecord from '../../../Common/NoRecord/NoRecord'
import Pagination from '../../../Common/Paginations/Paginations'
import './Investors.scss'
import WalletAddress from './WalletAddress/WalletAddress'

const Investors = () => {
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  useEffect(() => {
    getUsersList()
  }, [])

  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const [usersList, setUsersList] = useState<any>()
  const [selectedUser, setSelectedUser] = useState<string>()
  const [userInvestments, setUserInvestments] = useState<any>()
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<number>(0)
  const [address, setAddress] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)
  const [showConfModal, setShowConfModal] = useState(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleConfModalShow = () => setShowConfModal(true)


  useEffect(() => {
    selectedUser && getUserInvestments()
  }, [selectedUser])

  const getUsersList = useCallback(
    async (page: number = 1) => {
      let obj: { page: number; limit: number; search?: string } = {
        page: page,
        limit: TABLELIMIT,
      }
      if (address) {
        obj.search = address
      }
      setLoading(true)

      let result: any = await dispatch(callApiGetMethod('GET_USERS_LIST', obj, false))
      if (result?.success) {
        setUsersList(result?.data?.docs)
        if (result?.data?.docs.length > 0) {
          setTotalPage(result?.data?.totalPages)
          setCurrentPage(page)
          setTotalData(result?.data?.totalDocs)
          setSelectedUser(result?.data?.docs[0].user)
        }
      }
      setLoading(false)
    },
    [address, dispatch]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getUsersList(page)
    },
    [getUsersList]
  )
  useDebounce(() => getUsersList(), 1000, [address])

  const getUserInvestments = async () => {
    let res: any = await dispatch(callApiGetMethod('GET_USER_INVESTMENT', { user: selectedUser }, false))
    if (res?.success) {
      setUserInvestments(res?.data[0])
    }
  }

  const exportData = async () => {
    handleConfModalClose()
    await dispatch(openInNewTab('EXPORT_ALL_USERS_AND_INVESTMENTS'))
  }

  return (
    <>
      <div className="investorsPage">
        <Row className="gx-xl-5">
          <Col xs={12} lg={4} xl={4} className="d-flex">
            <div className="investorWalletbox commonCardbox w-100">
              <div className="mb-4 mb-md-5">
                <h4>User Management</h4>
              </div>
              <CommonSearch
                label="Search Wallet Address"
                placeholder="Search Wallet Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={42}
              />
              <WalletAddress
                selectedUser={selectedUser}
                usersList={usersList}
                callback={setSelectedUser}
                loading={loading}
              />

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
          </Col>
          <Col xs={12} lg={8} xl={8} className="d-flex mt-5 mt-lg-0">
            <div className="investmentCard w-100">
              <div className="investmentInfo">
                <div className="d-sm-flex align-items-start justify-content-between mb-4 mb-md-4">
                  <h5>Investment Information</h5>
                  <CommonButton title="Data Export and Backup" onlyIcon={<UploadIcon />} onClick={handleConfModalShow} />
                </div>
                <Row>
                  <Col xs={12} sm={6} xxl={3} className="d-flex">
                    <AssetBoxCard
                      title="Wallet Address"
                      text={
                        userInvestments ? (
                          <>
                            {' '}
                            <CopyAddress text={selectedUser} />
                          </>
                        ) : (
                          '-'
                        )
                      }
                      className="w-100"
                    />
                  </Col>
                  <Col xs={12} sm={6} xxl={3} className="d-flex">
                    <AssetBoxCard
                      title="Invested Portfolios"
                      text={userInvestments?.totalInvestedPortfolios ? userInvestments?.totalInvestedPortfolios : '-'}
                      className="w-100"
                    />
                  </Col>
                  <Col xs={12} sm={6} xxl={3} className="d-flex">
                    {userInvestments?.investedPortfolios?.length > 1 ? (
                      <AssetBoxCard
                        title="Portfolios Name"
                        text={userInvestments?.investedPortfolios ? userInvestments?.investedPortfolios[0]?.name : '-'}
                        link={userInvestments}
                        linktext="View All"
                        className="w-100"
                        onClick={handleShow}
                      />
                    ) : (
                      <AssetBoxCard
                        title="Portfolios Name"
                        text={userInvestments?.investedPortfolios ? userInvestments?.investedPortfolios[0]?.name : '-'}
                        className="w-100"
                      />
                    )}
                  </Col>
                  <Col xs={12} sm={6} xxl={3} className="d-flex">
                    <AssetBoxCard
                      title="AUM Fees Collected"
                      text={
                        userInvestments?.totalAdminAumFees
                          ? `${divideBigNumber(
                            userInvestments?.totalAdminAumFees?.$numberDecimal.toString(),
                            tokenDecimals
                          )} ${tokenSymbol}`
                          : '-'
                      }
                      className="w-100"
                    />
                  </Col>
                </Row>
              </div>
              <div className="transaction_table mt-4 mt-xxl-5">
                <h5 className="mb-4">Transaction History</h5>
                {selectedUser ? (
                  <TransactionHistoryTable selectedUser={selectedUser} />
                ) : (
                  <NoRecord text="Investor" loading={loading} shimmerType="table" />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <PortfoliosNameModal
        show={show}
        handleClose={handleClose}
        investedPortfolios={userInvestments?.investedPortfolios}
      />
      <ConfirmationModal
        text={`Are you sure you want to export data in csv file?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={exportData}
      />
    </>
  )
}

export default Investors
