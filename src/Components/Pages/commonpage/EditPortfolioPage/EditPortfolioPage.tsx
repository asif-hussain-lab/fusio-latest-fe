import { useFormik } from 'formik'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionMeta, OnChangeValue } from 'react-select'
import { useAccount } from 'wagmi'
import Web3 from 'web3'
import * as yup from 'yup'
import { InfoIcon } from '../../../../Assets/Images/Icons/SvgIcons'
import { RedCrossIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod, callApiPostMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import {
  addBigNumber,
  allowOnlyNumberWithDecimalsInput,
  multiplyBigDigitsWithDecimals,
} from '../../../../Services/common.service'
import {
  CF_AUM_FEE_RANGE,
  COUNTRY_TO_RESTRICT,
  EXPECTED_RETURNS,
  PORTFOLIO_TYPE,
  REINVEST_REQUEST_STATUS,
} from '../../../../Utils/Utils'
import CommonButton from '../../../Common/Button/CommonButton'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import CustomTooltip from '../../../Common/CustomTooltip/CustomTooltip'
import InputCustom from '../../../Common/Inputs/InputCustom'
import CustomSelect from '../../../Common/Select/Select'
import toaster from '../../../Common/Toast'
import './EditPortfolioPage.scss'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'

const orderOptions = (values: any) => {
  return values.filter((v) => v.isFixed).concat(values.filter((v: any) => !v.isFixed))
}

export const EditPortfolioPage = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const country = useSelector((state: any) => state.user.country)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const refreshUserData = useSelector((state: any) => state.user.refreshUserData)
  const [expectedReturns, setExpectedReturns] = useState<any>('')
  const [portfolioDetails, setPortfolioDetails] = useState<any>()
  const [options, setOptions] = useState<any>([])
  const [currencyList, setCurrencyList] = useState<any>([])
  const [selectedCurrencies, setSelectedCurrencies] = useState<any>([])
  const [value, setValue] = useState<any>([])
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')
  const [width, setWidth] = useState<number>(0)
  const [pendingReinvestmentRequests, setPendingReinvestmentRequests] = useState<any>()
  const [show, setShow] = useState<boolean>(false)
  const [activeButton, setActiveButton] = useState<string>('')
  const handleClose = () => setShow(false)
  const prevRefreshUserData = useRef(refreshUserData)
  const navigate = useNavigate()
  const [totalAssetAllocation, setTotalAssetAllocation] = useState<any>(0)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)

  const handleDisclaimerClose = () => setShowDisclaimer(false)
  useEffect(() => {
    if (country) {
      if (portfolioDetails?.portfolioId === PORTFOLIO_TYPE.legacy) {
        setShowDisclaimer(false)
      } else if (country === COUNTRY_TO_RESTRICT) {
        setShowDisclaimer(true)
      }
    }
  }, [portfolioDetails])

  useEffect(() => {
    const calculateTotalAllocation = () => {
      let totalAllocation: any = 0
      value?.length > 0 &&
        value.map((item) => {
          if (item?.value?.allocation >= 0) {
            let numberToAdd: any = parseInt(multiplyBigDigitsWithDecimals(String(item?.value?.allocation), '100'))
            totalAllocation = addBigNumber(totalAllocation, numberToAdd)
            setTotalAssetAllocation(totalAllocation / 100)
          }
        })
    }
    value && calculateTotalAllocation()
  }, [value])

  useEffect(() => {
    if (walletAddress) {
      getWindowDimensions()
      getTokenList()
      getPortfolioDetails()
      if (portfolioDetails && walletAddress.toLowerCase() !== portfolioDetails?.createdBy.toLowerCase()) {
        navigate('/dashboard')
      }
    } else if (
      portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf ||
      portfolioDetails?.portfolioType === PORTFOLIO_TYPE.byop
    ) {
      navigate('/dashboard')
    }
  }, [walletAddress])

  useEffect(() => {
    if (prevRefreshUserData.current !== refreshUserData) {
      getPendingReinvestmentRequests(false)
      prevRefreshUserData.current = refreshUserData
    } else {
      getPendingReinvestmentRequests()
    }
  }, [walletAddress, refreshUserData])

  const getWindowDimensions = () => {
    setWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', getWindowDimensions)
    return () => {
      window.removeEventListener('resize', getWindowDimensions)
    }
  })

  useEffect(() => {
    if (currencyList.length > 0 && selectedCurrencies.length > 0) {
      createOptions(currencyList, selectedCurrencies)
    }
  }, [selectedCurrencies, currencyList])

  const createOptions = (currencyList, selectedCurrencies) => {
    const currencyMap = selectedCurrencies.reduce((acc, obj) => {
      acc[obj.address] = obj.allocation
      return acc
    }, {})
    const options = currencyList.map((item) => {
      item.allocation =
        currencyMap[item.address] === undefined || currencyMap[item.address] === 0
          ? ''
          : currencyMap[item.address] / 100
      return {
        isFixed: currencyMap[item.address] !== undefined,
        value: item,
        label: (
          <span
            dangerouslySetInnerHTML={{
              __html: `<img src=${item.icon} alt="Currency-Logo" className="currencyLogo"/> ${item.symbol}`,
            }}
          />
        ),
      }
    })
    let value = options.filter((item) => currencyMap[item.value.address] !== 0 && item.isFixed === true)
    // let value = options.filter((item) => item.isFixed === true)/
    setValue(value)
    setOptions(options)
  }

  const onChange = (newValue: OnChangeValue<any, true>, actionMeta: ActionMeta<any>) => {
    switch (actionMeta.action) {
      case 'remove-value':
      case 'pop-value':
        if (actionMeta.removedValue.isFixed) {
          return
        }
        break
      case 'clear':
        newValue = options.filter((v) => v.isFixed)
        break
    }
    const selectedIds = new Set(newValue.map((option) => option?.value?.address))
    options.forEach((option) => {
      if (!selectedIds.has(option?.value?.address)) {
        option.value.allocation = ''
      }
    })
    setValue(orderOptions(newValue))
  }

  const validationSchema = yup.object({
    portfolioName: yup.string().required('Required field*').min(5, 'Too Short!').max(30, 'Too Long!'),
    aum: yup
      .number()
      .required('Required field*')
      .min(CF_AUM_FEE_RANGE.MIN, `Transaction Fees should be between ${CF_AUM_FEE_RANGE.MIN}%-${CF_AUM_FEE_RANGE.MAX}%`)
      .max(
        CF_AUM_FEE_RANGE.MAX,
        `Transaction Fees should be between ${CF_AUM_FEE_RANGE.MIN}%-${CF_AUM_FEE_RANGE.MAX}%`
      ),
    ticker: yup.string().required('Required field*').max(5, 'Too Long!'),
    expectedReturns: yup.string().required('Required field*'),
  })

  const formik = useFormik({
    initialValues: {
      portfolioName: '',
      ticker: '',
      expectedReturns: '',
      aum: 0,
    },
    onSubmit: (values) => {
      updatePortfolio(values)
    },
    validationSchema,
  })

  const getPortfolioDetails = async () => {
    let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_DETAILS', { id: id }))
    if (result?.success) {
      formik.setFieldValue('portfolioName', result?.data?.portfolioName)
      formik.setFieldValue('ticker', result?.data?.portfolioTicker)
      formik.setFieldValue('aum', result?.data?.aumFees / 100)
      formik.setFieldValue('expectedReturns', result?.data?.expectedReturns)
      setExpectedReturns({ value: result?.data?.expectedReturns, label: result?.data?.expectedReturns })
      setPortfolioDetails(result?.data)
      let selectedCurrencies: any = result?.data?.currencies
      setSelectedCurrencies(selectedCurrencies)
    }
  }

  const getTokenList = async () => {
    let result: any = await dispatch(callApiGetMethod('GET_ALL_WHITELISTED_TOKENS'))
    if (result?.success) {
      setCurrencyList(result?.data)
    }
  }

  const getPendingReinvestmentRequests = useCallback(
    async (loading: boolean = true) => {
      let result: any = await dispatch(
        callApiGetMethod(
          'GET_PENDING_REBALANCE_REQUESTS',
          {
            portfolioId: id,
          },
          false
        )
      )
      if (result?.success) {
        setPendingReinvestmentRequests(result?.data)
      }
    },
    [dispatch, id, refreshUserData]
  )

  const handleAllocationChange = (index, newAllocation) => {
    if (newAllocation < 0) {
      toaster.error('Allocation must be greater than 0')
    } else {
      setValue((data) => {
        const updatedAllocation = [...data]
        updatedAllocation[index].value.allocation = newAllocation
        return updatedAllocation
      })
    }
  }

  const handleDelete = (index: number) => {
    setValue((data) => {
      const updatedData = [...data]
      updatedData.splice(index, 1)
      return updatedData
    })
  }

  const updatePortfolio = async (values) => {
    if (
      portfolioDetails?.expectedReturns !== expectedReturns?.value ||
      portfolioDetails?.portfolioName !== values?.portfolioName ||
      portfolioDetails?.portfolioTicker !== values?.ticker ||
      (portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf && portfolioDetails?.aumFees !== values?.aum * 100)
    ) {
      let signature: any = await dispatch(
        callApiGetMethod(
          'GET_UPDATE_DETAILS_SIGNATURE',
          {
            portfolioId: portfolioDetails?.portfolioId,
            aumFees: values?.aum * 100,
            expectedReturns: expectedReturns.value,
            portfolioName: values?.portfolioName,
            portfolioTicker: values?.ticker,
          },
          false,
          true,
          'updateDetails'
        )
      )
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateAumFeeAndPortfolioName',
          [
            parseInt(id ?? '0'),
            values?.aum * 100,
            Web3.utils.toHex(expectedReturns.value),
            Web3.utils.toHex(values?.portfolioName),
            Web3.utils.toHex(values?.ticker),
            signature?.data?.signature,
          ],
          walletAddress,
          'portfolio',
          'updateDetails'
        )
      )

      if (result?.status) {
        toaster.success('Portfolio successfully updated')
      }
    } else {
      toaster.error('Please make some changes to update Portfolio')
    }
  }

  const updateAssets = async (data: any) => {
    let allocations: any = []
    let addresses: any = []
    let portfolioId = portfolioDetails?.portfolioId
    let isAllocationZero = false
    let flag: boolean = false
    data?.map((item, index) => {
      if (item?.value?.allocation >= 0) {
        allocations[index] = parseInt(multiplyBigDigitsWithDecimals(String(item?.value?.allocation), '100'))
        addresses[index] = item?.value?.address
        if (!item?.isFixed && item?.value?.allocation <= 0) {
          isAllocationZero = true
        }
      }
      return isAllocationZero
    })

    value.map((item: any) => {
      addresses.forEach((address: any, index: number) => {
        if (item.value.address === address) {
          parseInt(item.value.allocation) !== allocations[index] && (flag = true)
        }
      })
    })

    if (!flag) {
      return toaster.error('Please make some changes to update assets.')
    } else if (totalAssetAllocation !== 100) {
      return toaster.error('Allocations must be 100%')
    } else if (isAllocationZero) {
      return toaster.error('Allocations of new assets should be greater than 0')
    } else {
      let signature: any = await dispatch(
        callApiGetMethod('GET_UPDATE_ASSET_SIGNATURE', { portfolioId: portfolioId }, false, true, 'updateAsset')
      )
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateCurrAndAllocOfPortfolio',
          [portfolioId, allocations, addresses, signature?.data?.signature],
          walletAddress,
          'portfolio',
          'updateAssets'
        )
      )
      if (result?.status) {
        toaster.success('Assets and allocations updated successfully')
      } else {
        console.log('error occured')
      }
    }
  }

  const submitUpdateAssetsReq = async (data: any) => {
    let allocations: any = []
    let addresses: any = []
    let portfolioId = portfolioDetails?.portfolioId
    let isAllocationZero = false
    let flag: boolean = false

    data?.map((item, index) => {
      if (item?.value?.allocation >= 0) {
        allocations[index] = parseInt(multiplyBigDigitsWithDecimals(String(item?.value?.allocation), '100'))
        addresses[index] = item?.value?.address
        if (!item?.isFixed && item?.value?.allocation <= 0) {
          isAllocationZero = true
        }
      }
      return isAllocationZero
    })
    selectedCurrencies.map((item: any) => {
      addresses.forEach((address: any, index: number) => {
        if (item.address === address) {
          item.allocation !== allocations[index] && (flag = true)
        }
      })
    })

    if (!walletAddress) {
      return toaster.error('Please Connect Wallet')
    } else if (!flag) {
      return toaster.error('Please make some changes to update assets.')
    } else if (totalAssetAllocation !== 100) {
      return toaster.error('Allocations must be 100%')
    } else if (isAllocationZero) {
      return toaster.error('Allocations of new assets should be greater than 0')
    } else {
      const response: any = await dispatch(
        callApiPostMethod(
          'SUBMIT_REBALANCE_REQUESTS',
          {
            portfolioId: portfolioId,
            allocations: allocations,
            currencies: addresses,
            user: walletAddress,
          },
          true
        )
      )
      if (response?.success) {
        handleClose()
      } else {
        console.log('error occured')
      }
    }
  }

  const cancelPendingRequest = async () => {
    if (!walletAddress) {
      return toaster.error('Please Connect Wallet')
    } else {
      const response: any = await dispatch(
        callApiPostMethod(
          'CANCEL_REINVESTMENT_REQUEST',
          {
            portfolioId: portfolioDetails?.portfolioId,
            user: walletAddress,
            requestId: pendingReinvestmentRequests?._id,
          },
          true
        )
      )
      if (response?.success) {
        handleClose()
      }
    }
  }

  return (
    <div
      className={`dashboardUser ${
        portfolioDetails?.portfolioType && parseInt(portfolioDetails?.portfolioType) === PORTFOLIO_TYPE.legacy
          ? ''
          : 'pt-40'
      } undefined`}
    >
      <Container>
        <div className="fundForm commonBasecard">
          <h4 className="mb-4">Edit Portfolio</h4>
          <form onSubmit={formik.handleSubmit}>
            <Row>
              <Col md={6} sm={12} xs={12}>
                <InputCustom
                  id="portfolioName"
                  name="portfolioName"
                  label={
                    <span className="d-flex aling-items-center">
                      Portfolio Name{' '}
                      <CustomTooltip
                        className="ms-1 rightIcon"
                        icon={<InfoIcon />}
                        text="Name length 5-30 characters"
                      />
                    </span>
                  }
                  placeholder="Enter Name"
                  maxLength={30}
                  onChange={formik.handleChange}
                  value={formik.values.portfolioName}
                  isInvalid={formik.touched.portfolioName && !!formik.errors.portfolioName}
                  error={
                    formik.errors.portfolioName && formik.touched.portfolioName ? (
                      <span className="error-message">{formik.errors.portfolioName}</span>
                    ) : null
                  }
                />
              </Col>
              <Col md={6} sm={12} xs={12}>
                <InputCustom
                  id="ticker"
                  name="ticker"
                  label={
                    <span className="d-flex aling-items-center">
                      Portfolio Ticker{' '}
                      <CustomTooltip
                        className="ms-1 rightIcon"
                        icon={<InfoIcon />}
                        text="Ticker length 1-5 characters"
                      />
                    </span>
                  }
                  placeholder="Enter Ticker"
                  maxLength={5}
                  onChange={formik.handleChange}
                  value={formik.values.ticker}
                  isInvalid={formik.touched.ticker && !!formik.errors.ticker}
                  error={
                    formik.errors.ticker && formik.touched.ticker ? (
                      <span className="error-message">{formik.errors.ticker}</span>
                    ) : null
                  }
                />
              </Col>
              <Col md={6} sm={12} xs={12}>
                <label className="form-label" htmlFor="Asset">
                  Expected Returns
                </label>
                <CustomSelect
                  className="input_select"
                  name="expectedReturns"
                  isSearchable={false}
                  options={EXPECTED_RETURNS}
                  value={expectedReturns}
                  placeholder="Select Expected Returns"
                  onChange={(selectedOption) => {
                    formik.values.expectedReturns = selectedOption.value
                    setExpectedReturns(selectedOption)
                  }}
                  error={
                    formik?.values?.expectedReturns?.length <= 0 &&
                    formik.errors.expectedReturns &&
                    formik.touched.expectedReturns ? (
                      <span className="error-message">{formik.errors.expectedReturns}</span>
                    ) : null
                  }
                />
              </Col>
              <Col md={6} sm={12} xs={12}>
                {portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf ? (
                  <InputCustom
                    id="aum"
                    name="aum"
                    label={
                      <span className="d-flex aling-items-center">
                        Transaction Fees{' '}
                        <CustomTooltip
                          className="ms-1 rightIcon"
                          icon={<InfoIcon />}
                          text={`Transaction Fees (${CF_AUM_FEE_RANGE.MIN}%-${CF_AUM_FEE_RANGE.MAX}%)`}
                        />
                      </span>
                    }
                    placeholder="Enter Fees"
                    onChange={(e: any) => {
                      if (e.target.value <= 100) {
                        let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                        isValid && formik.handleChange(e)
                      }
                    }}
                    value={formik.values.aum}
                    isInvalid={formik.touched.aum && !!formik.errors.aum}
                    error={
                      formik.errors.aum && formik.touched.aum ? (
                        <span className="error-message">{formik.errors.aum}</span>
                      ) : null
                    }
                  >
                    <span className="allocP">%</span>
                  </InputCustom>
                ) : (
                  <div className="transactionHeadinges">
                    <h6>Transaction Fees {formik.values.aum}%</h6>
                    <CustomTooltip
                      className="ms-1 rightIcon"
                      icon={<InfoIcon />}
                      text="Transaction Fees: 50% deducted on deposit, 50% on withdrawal!"
                    />
                  </div>
                )}
              </Col>
              <div className="text-center mt-4">
                <CommonButton
                  type="submit"
                  title="Update Details"
                  disabled={!expectedReturns || !portfolioDetails}
                  buttonLoader={'updateDetails'}
                />
              </div>
            </Row>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateAssets(value)
            }}
          >
            <Row>
              <Col xs={12}>
                <label className="form-label" htmlFor="Asset">
                  Assets
                </label>
              </Col>
              <Col xs={12} className="mb-5">
                <label className="form-label" htmlFor="Asset">
                  Search Asset
                </label>
                <CustomSelect
                  className="input_select"
                  options={options}
                  value={value}
                  placeholder={'Search Asset Name'}
                  isClearable={value.some((v) => !v.isFixed)}
                  name="select"
                  onChange={onChange}
                  isMulti={true}
                  filterOption={(option: any, inputValue: string) =>
                    option.value.symbol.toLowerCase().includes(inputValue.toLowerCase())
                  }
                  closeMenuOnSelect={options.length === value.length + 1}
                />
              </Col>
              <Col xs={12}>
                {value.length ? (
                  <>
                    <Row>
                      {value.map((item: any, index: number) => {
                        return (
                          <Col md={4} xs={12} key={item?.value?._id}>
                            {index < (width > 767 ? 3 : 1) && (
                              <Row>
                                <Col xs={6}>
                                  <label className="form-label" htmlFor="Asset">
                                    Asset
                                  </label>
                                </Col>
                                <Col xs={6}>
                                  <label className="form-label" htmlFor="Asset">
                                    Allocation %
                                  </label>
                                </Col>
                              </Row>
                            )}
                            <Row>
                              <Col xs={6}>
                                <div className="customInput">
                                  <div className="form-control d-flex align-items-center">
                                    <img src={item?.value?.icon} alt="Currency-Logo" className="me-3 currencyLogo" />{' '}
                                    <h6>{item?.value?.symbol}</h6>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <InputCustom
                                  id="allocation"
                                  name="allocation"
                                  required
                                  min={0}
                                  placeholder=""
                                  onChange={(e: any) => {
                                    if (e.target.value <= 100) {
                                      let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                                      isValid && handleAllocationChange(index, e.target.value)
                                    }
                                  }}
                                  value={item.value.allocation}
                                >
                                  <span className="allocP">%</span>
                                </InputCustom>
                              </Col>
                              {!item?.isFixed && (
                                <Col xs={2}>
                                  <div
                                    className="RemoveIcon"
                                    onClick={() => {
                                      handleAllocationChange(index, '')
                                      handleDelete(index)
                                    }}
                                  >
                                    <RedCrossIcon />
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Col>
                        )
                      })}
                      <div className="d-flex aling-items-center">
                        <h6 style={{color: "black"}}>Total Asset Allocation {totalAssetAllocation}%</h6>
                      </div>
                    </Row>
                  </>
                ) : (
                  ''
                )}
              </Col>
              <div className="groupBtn mt-3 pt-md-4 d-flex justify-content-center">
                {portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf ? (
                  <CommonButton
                    type="button"
                    className="me-3"
                    title="request to update assets"
                    buttonLoader={'submitUpdateAssetsReq'}
                    onClick={() => {
                      setActiveButton('update')
                      setShow(true)
                    }}
                    disabled={pendingReinvestmentRequests?.status === REINVEST_REQUEST_STATUS.PENDING}
                  />
                ) : (
                  <CommonButton type="submit" className="me-3" title="update assets" buttonLoader={'updateAssets'} />
                )}
              </div>
              {portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf &&
                pendingReinvestmentRequests?.status === REINVEST_REQUEST_STATUS.PENDING && (
                  <div className="groupBtn pt-md-4 d-flex justify-content-center">
                    <h6 className="me-3">The portfolio has a pending update request.</h6>
                    <button
                      type="button"
                      className="cancelbtn"
                      onClick={() => {
                        setActiveButton('cancel')
                        setShow(true)
                      }}
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              {portfolioDetails?.portfolioType === PORTFOLIO_TYPE.cf &&
                pendingReinvestmentRequests?.status === REINVEST_REQUEST_STATUS.REJECTED && (
                  <div className="groupBtn pt-md-4 d-flex justify-content-center">
                    <h6 className="me-3 red_text">*Your last update assets request was rejected.</h6>
                  </div>
                )}
            </Row>
          </form>
        </div>
      </Container>
      <ConfirmationModal
        text={`Are you sure you want to ${activeButton === 'update' ? 'sent' : 'cancel'} request for update assets?`}
        show={show}
        handleClose={handleClose}
        callBack={() => {
          activeButton === 'update' ? submitUpdateAssetsReq(value) : cancelPendingRequest()
        }}
        buttonLoader={activeButton === 'update' ? 'updateAsset' : 'cancel'}
      />
      
    </div>
  )
}
