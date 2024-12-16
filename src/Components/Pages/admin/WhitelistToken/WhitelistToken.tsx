import moment from 'moment'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { LinkIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { customizeAddress } from '../../../../Services/common.service'
import { TABLELIMIT } from '../../../../Utils/Utils'
import CommonLink from '../../../Common/CommonLink/CommonLink'
import { AddTokenModal } from '../../../Common/CommonModal/AddTokenModal/AddTokenModal'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import CommonTable from '../../../Common/CommonTable/CommonTable'
import Switch from '../../../Common/FormInputs/Switch'
import Pagination from '../../../Common/Paginations/Paginations'
import toaster from '../../../Common/Toast'
import '../IncomeAnalysis/IncomeAnalysis.scss'
import './WhitelistToken.scss'
import PercentageChange from '../../../Common/PercentageChange/PercentageChange'
import CustomTooltip from '../../../Common/CustomTooltip/CustomTooltip'

const WhitelistToken = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [show, setShow] = useState(false)
  const [whitelistedTokenList, setWhitelistedTokenList] = useState<any>([])
  const [totalPage, setTotalPage] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalData, setTotalData] = useState<any>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [currencyToDisable, setCurrencyToDisable] = useState<any>()
  const [showConfModal, setShowConfModal] = useState(false)
  const prevRefreshUserData = useRef(refreshUserData)
  const handleClose = () => setShow(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleShow = () => setShow(true)
  const handleConfModalShow = (data: any) => {
    setCurrencyToDisable(data)
    setShowConfModal(true)
  }

  const fields = [
    'Sr No',
    'Icon',
    'Name',
    'Symbol',
    'Price (Change per hour)',
    'Decimals',
    'Currency Address',
    'Added at',
    'Action',
  ]

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      getWhitelistedTokenList(currentPage, false)
      prevRefreshUserData.current = refreshUserData
    } else {
      getWhitelistedTokenList()
    }
  }, [refreshUserData])

  const getWhitelistedTokenList = useCallback(
    async (page: number = 1, loading = true) => {
      const obj: { page: number; limit: number } = {
        page: page,
        limit: TABLELIMIT,
      }
      if (loading) setLoading(true)
      let result: any = await dispatch(callApiGetMethod('GET_WHITELISTED_TOKENS', obj, false))
      if (result?.success) {
        setTotalPage(result?.data?.totalPages)
        setCurrentPage(page)
        setTotalData(result?.data?.totalDocs)
        setWhitelistedTokenList(result?.data?.docs)
      }
      setLoading(false)
    },
    [dispatch, refreshUserData]
  )

  const onPageChanged = useCallback(
    (event: any, page: number) => {
      event.preventDefault()
      getWhitelistedTokenList(page)
    },
    [getWhitelistedTokenList]
  )

  const enableOrDisableCurrency = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'enableOrDisableCurrency',
        [currencyToDisable?.address],
        walletAddress,
        'portfolio',
        'disableOrEnableCurrency'
      )
    )
    if (result?.status) {
      handleConfModalClose()
      switch (currencyToDisable?.isEnable) {
        case true:
          return toaster.success(`${currencyToDisable?.name} disabled `)
        case false:
          return toaster.success(`${currencyToDisable?.name} enabled `)
        default:
          return null
      }
    } else {
      console.log('error occured')
    }
  }

  return (
    <>
      <div className="coin_Table">
        <div className="commonTopbar p-4 px-md-5 d-md-flex align-items-center justify-content-between">
          <h6>Whitelist Token</h6>
          <CommonLink text="Add Token Whitelist" onClick={handleShow} className="mt-3 mt-md-0 pb-3 pb-md-0" />
        </div>
        <CommonTable className="mb-4" fields={fields} loading={loading}>
          {whitelistedTokenList?.map((item: any, index: number) => (
            <tr key={item._id}>
              <td>{index + 1 + (currentPage - 1) * TABLELIMIT}</td>
              <td>
                <img className="currencyLogo" src={item?.icon} alt="Currency-Logo" />
              </td>
              <td>{item?.name}</td>
              <td>{item?.symbol}</td>
              <td>
                <span className="d-flex">
                  <CustomTooltip
                    className="copyTool me-2"
                    icon={<span>${parseFloat(item?.tokenPriceInfo?.currentPrice?.$numberDecimal).toFixed(5)}</span>}
                    text={`$${item?.tokenPriceInfo?.currentPrice?.$numberDecimal}`}
                  />{' '}
                  (
                  <PercentageChange
                    changeStatus={item?.tokenPriceInfo?.priceStatus}
                    percentageChange={item?.tokenPriceInfo?.percentageChange}
                  />
                  )
                </span>
              </td>
              <td>{Math.log10(item?.decimals?.$numberDecimal)}</td>
              <td>
                <a href={item?.exploreUrl} target="_blank" rel="noreferrer" className="currencyAddress">
                  {customizeAddress(item?.address)}
                  <span className="svgicon ms-2">
                    <LinkIcon />
                  </span>
                </a>
              </td>
              <td>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
              <td>
                <span className="SwitchToggle">
                  <Switch onChange={() => handleConfModalShow(item)} checked={item?.isEnable} />
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
      <AddTokenModal show={show} handleClose={handleClose} />
      <ConfirmationModal
        text={`Are you sure you want to ${currencyToDisable?.isEnable ? 'disable' : 'enable'} ${
          currencyToDisable?.name
        }?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={enableOrDisableCurrency}
        buttonLoader={'disableOrEnableCurrency'}
      />
    </>
  )
}

export default WhitelistToken
