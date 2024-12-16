import moment from 'moment'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { DeleteIcon, LinkIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { customizeAddress } from '../../../../Services/common.service'
import { TABLELIMIT } from '../../../../Utils/Utils'
import CommonLink from '../../../Common/CommonLink/CommonLink'
import { AddNftModal } from '../../../Common/CommonModal/AddNftModal/AddNftModal'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import CommonTable from '../../../Common/CommonTable/CommonTable'
import Switch from '../../../Common/FormInputs/Switch'
import Pagination from '../../../Common/Paginations/Paginations'
import toaster from '../../../Common/Toast'
import '../IncomeAnalysis/IncomeAnalysis.scss'
import './WhitelistNft.scss'

const WhitelistNft = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [show, setShow] = useState(false)
  const [whitelistedNftList, setWhitelistedNftList] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<any>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [nftToRemove, setNftToRemove] = useState<any>()
  const [showConfModal, setShowConfModal] = useState(false)
  const prevRefreshUserData = useRef(refreshUserData)
  const handleClose = () => setShow(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleShow = () => setShow(true)
  const handleConfModalShow = (data: any) => {
    setNftToRemove(data)
    setShowConfModal(true)
  }

  const fields = ['Sr No', 'Network', 'Nft Address', 'Added at', 'Action']

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      getWhitelistedNftList(currentPage, false)
      prevRefreshUserData.current = refreshUserData
    } else {
      getWhitelistedNftList()
    }
  }, [refreshUserData])

  const getWhitelistedNftList = useCallback(
    async (page: number = 1, loading = true) => {
      const obj: { page: number; limit: number } = {
        page: page,
        limit: TABLELIMIT,
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_WHITELISTED_NFTS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setWhitelistedNftList(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getWhitelistedNftList(page)
    },
    [getWhitelistedNftList]
  )

  const removeNft = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'removeWhitelistNft',
        [nftToRemove?.WhitelistNft, nftToRemove?.chainId],
        walletAddress,
        'portfolio',
        'removeWhitelistNft'
      )
    )
    if (result?.status) {
      handleConfModalClose()
      toaster.success('NFT removed successfully')
    } else {
      console.log('error occured')
    }
  }

  return (
    <>
      <div className="coin_Table">
        <div className="commonTopbar p-4 px-md-5 d-md-flex align-items-center justify-content-between">
          <h6>Whitelist Prospector NFT</h6>
          <CommonLink text="Whitelist NFT" onClick={handleShow} className="mt-3 mt-md-0 pb-3 pb-md-0" />
        </div>
        <CommonTable className="mb-4" fields={fields} loading={loading}>
          {whitelistedNftList?.map((item: any, index: number) => (
            <tr key={item._id}>
              <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
              <td>
                <img className="currencyLogo me-3" src={item?.network?.icon} alt="Currency-Logo" />
                {item?.network?.chainType}
              </td>
              <td>
                <a href={item?.viewUrl} target="_blank" rel="noreferrer" className="currencyAddress">
                  {customizeAddress(item?.viewUrl?.split('/')[5])}
                  <span className="svgicon ms-2">
                    <LinkIcon />
                  </span>
                </a>
              </td>
              <td>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
              <td>
                <span className="deleteIcon" onClick={() => handleConfModalShow(item)}>
                  <DeleteIcon />
                </span>
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
      <AddNftModal show={show} handleClose={handleClose} />
      <ConfirmationModal
        text={`Are you sure you want to remove ${nftToRemove?.WhitelistNft}?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={removeNft}
        buttonLoader={'removeWhitelistNft'}
      />
    </>
  )
}

export default WhitelistNft
