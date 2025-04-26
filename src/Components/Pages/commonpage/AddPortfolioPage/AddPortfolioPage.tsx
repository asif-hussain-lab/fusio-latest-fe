import { useFormik } from 'formik'
import { Dispatch, memo, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import cardBg from '../../../../Assets/Images/exploreCardBg.png'
import { useAccount } from 'wagmi'
import Web3 from 'web3'
import * as yup from 'yup'
import { InfoIcon } from '../../../../Assets/Images/Icons/SvgIcons'
import { RedCrossIcon, SearchIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractGetMethod, callContractSendMethod } from '../../../../Redux/Actions/contract.action'
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
  ZERO_ADDRESS,
  ZERO_ADDRESS_ARRAY,
} from '../../../../Utils/Utils'
import CommonButton from '../../../Common/Button/CommonButton'
import CustomTooltip from '../../../Common/CustomTooltip/CustomTooltip'
import InputCustom from '../../../Common/Inputs/InputCustom'
import CustomSelect from '../../../Common/Select/Select'
import toaster from '../../../Common/Toast'
import './AddPortfolioPage.scss'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'

import { useTheme } from '../../../../Utils/ThemeContext'

const AddPortfolioModal = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const navigate = useNavigate()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const country = useSelector((state: any) => state.user.country)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const type = queryParams.get('type')
  const validationSchema1 = yup.object({
    portfolioName: yup.string().required('Required field*').min(5, 'Too Short!').max(30, 'Too Long!'),
    ticker: yup.string().required('Required field*').max(5, 'Too Long!'),
    expectedReturns: yup.string().required('Required field*'),
    select: yup.array().min(1, 'Required field*'),
  })
  const validationSchema2 = yup.object({
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
    select: yup.array().min(1, 'Required field*'),
  })

    const { theme, toggleTheme } = useTheme()

  const formik = useFormik({
    initialValues: {
      portfolioName: '',
      ticker: '',
      aum: '',
      select: [],
      expectedReturns: '',
    },
    onSubmit: (values) => {
      createPortfolio(values)
    },
    validationSchema: type && parseInt(type) === PORTFOLIO_TYPE.cf ? validationSchema2 : validationSchema1,
  })
  const [options, setOptions] = useState<any>([])
  const [aumFee, setAumFee] = useState<any>()
  const [selectedCurrencies, setSelectedCurrencies] = useState<any>([])
  const [expectedReturns, setExpectedReturns] = useState<any>('')
  const [isProspectorNftPresent, setIsProspectorNftPresent] = useState<boolean>(false)
  const [portfolioType, setPortfolioType] = useState<any>(0)
  const [msg, setMsg] = useState<any>('')
  const [width, setWidth] = useState<number>(0)
  const [signature, setSignature] = useState<any>(ZERO_ADDRESS_ARRAY)
  const [prospectorNft, setProspectorNft] = useState<any>()
  const [totalAssetAllocation, setTotalAssetAllocation] = useState<any>(0)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)

  const handleDisclaimerClose = () => setShowDisclaimer(false)
   useEffect(() => {
     if (country) {
       if (parseInt(type ?? '0')===PORTFOLIO_TYPE.legacy) {
         setShowDisclaimer(false)
       } else if (country === COUNTRY_TO_RESTRICT) {
         setShowDisclaimer(true)
       }
     }
   }, [type])
  
  useEffect(() => {
    const calculateTotalAllocation = () => {
      let totalAllocation: any = 0
      selectedCurrencies?.length > 0
        ? selectedCurrencies.map((item) => {
            if (item?.value?.allocation >= 0) {
              let numberToAdd: any = multiplyBigDigitsWithDecimals(String(item?.value?.allocation), '100')
              totalAllocation = addBigNumber(totalAllocation, numberToAdd)
              setTotalAssetAllocation(totalAllocation / 100)
            }
          })
        : setTotalAssetAllocation(0)
    }
    calculateTotalAllocation()
  }, [selectedCurrencies])

  useEffect(() => {
    getTokenList()
    getWindowDimensions()
    getAumFee(parseInt(type ?? '0'))
    setPortfolioType(parseInt(type ?? '0'))
    formik.resetForm()
  }, [type])

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
    walletAddress && type && parseInt(type) === PORTFOLIO_TYPE.cf && getCfSign()
  }, [walletAddress, type, dispatch])

  const getCfSign = async () => {
    try {
      let text = ''
      let result: any = await dispatch(callApiGetMethod('GET_CF_SIGNATURE', { user: walletAddress }, false))
      if (result.success) {
        if (result?.data?.prospectorNft) {
          setIsProspectorNftPresent(true)
          setProspectorNft(result.data.prospectorNft)
          setSignature(result.data.signature)
        } else {
          text = 'To establish a curated fund, you must possess a Prospector NFT !'
        }
      }
      setMsg(text)
    } catch (error) {
      console.log('error', error)
    }
  }

  const getTokenList = async (page: number = 1) => {
    let result: any = await dispatch(callApiGetMethod('GET_ALL_WHITELISTED_TOKENS', {}, false))
    if (result?.success) {
      fetchOptions(result?.data)
    }
  }

  const fetchOptions = async (data: any) => {
    try {
      const options: any = data.map((item) => {
        item.allocation = ''
        return {
          value: item,
          label: (
            <span
              dangerouslySetInnerHTML={{
                __html: `<img src=${item.icon} className="currencyLogo" key=${item.symbol}/> ${item.symbol}`,
              }}
            />
          ),
        }
      }).sort((a, b) => {
        const priorityTokens = ['BTCB', 'ETH','XRP','WBNB','SOL','DOGE','ADA','LINK'];
        const symbolA = a.value.symbol.toUpperCase();
        const symbolB = b.value.symbol.toUpperCase();
        
        // If both tokens are priority tokens, sort them according to priority order
        if (priorityTokens.includes(symbolA) && priorityTokens.includes(symbolB)) {
          return priorityTokens.indexOf(symbolA) - priorityTokens.indexOf(symbolB);
        }
        
        // If only one token is a priority token, it should come first
        if (priorityTokens.includes(symbolA)) return -1;
        if (priorityTokens.includes(symbolB)) return 1;
        
        // For all other tokens, sort alphabetically
        return symbolA.localeCompare(symbolB);
      });
      setOptions(options)
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const createPortfolio = async (values: any) => {
    let allocations: any = []
    let addresses: any = []
    let portfolioName = values?.portfolioName.trim()
    let isAllocationZero = false
    selectedCurrencies?.length > 0 &&
      selectedCurrencies.map((item, index) => {
        if (item?.value?.allocation > 0) {
          allocations[index] = parseInt(multiplyBigDigitsWithDecimals(String(item?.value?.allocation), '100'))
          addresses[index] = item?.value?.address
          isAllocationZero = false
        } else {
          isAllocationZero = true
        }
        return isAllocationZero
      })
    if (selectedCurrencies.length <= 0) {
      return toaster.error('Please select atleast one asset')
    } else if (totalAssetAllocation !== 100) {
      return toaster.error('Allocations must be 100%')
    } else if (isAllocationZero) {
      return toaster.error('Allocations should be greater than 0')
    } else if (values?.expectedReturns <= 0) {
      return toaster.error('Expected Returns should be greater than 0')
    } else {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'createPortfolio',
          [
            [
              portfolioType,
              values?.aum * 100,
              true,
              Web3.utils.toHex(portfolioName),
              Web3.utils.toHex(values?.ticker),
              Web3.utils.toHex(expectedReturns.value),
              prospectorNft?.whiteListedNFT?.chainId ?? 0,
              prospectorNft?.whiteListedNFT?.WhitelistNft ?? ZERO_ADDRESS,
            ],
            [prospectorNft?.tokenId ?? 0],
            allocations,
            addresses,
            signature,
          ],
          walletAddress,
          'portfolio',
          'createPortfolio'
        )
      )
      if (result?.status) {
        toaster.success('Portfolio created successfully')
        formik.resetForm()
        setExpectedReturns('')
        setSelectedCurrencies('')
        if (portfolioType === PORTFOLIO_TYPE.legacy) {
          navigate('/admin/portfolio/manage-portfolio')
        } else {
          navigate('/explore')
        }
      } else {
        console.log('error occured')
      }
    }
  }

  const handleAllocationChange = (index, newAllocation) => {
    if (newAllocation < 0) {
      toaster.error('Allocation must be greater than 0')
    } else {
      setSelectedCurrencies((data) => {
        const updatedAllocation = [...data]
        updatedAllocation[index].value.allocation = newAllocation
        return updatedAllocation
      })
    }
  }

  const handleDelete = (index: number) => {
    setSelectedCurrencies((data) => {
      const updatedData = [...data]
      updatedData.splice(index, 1)
      return updatedData
    })
  }
  const getAumFee = async (portfolioType: any) => {
    switch (portfolioType) {
      case 1: {
        const result: any = await dispatch(callContractGetMethod('platformFees', [], 'portfolio', false))
        if (result) {
          formik.setFieldValue('aum', result / 100)
          setAumFee(result / 100)
        }
        break
      }
      case 2: {
        formik.setFieldValue('aum', '')
        setAumFee('')
        break
      }
      case 3: {
        const result: any = await dispatch(callContractGetMethod('BYOPFees', [], 'portfolio', false))
        if (result) {
          formik.setFieldValue('aum', result / 100)
          setAumFee(result / 100)
        }
        break
      }
      default: {
        setAumFee('')
        break
      }
    }
  }

  function renderSwitch(portfolioType: any) {
    switch (parseInt(portfolioType)) {
      case PORTFOLIO_TYPE.legacy:
        return 'Legacy Portfolio'
      case PORTFOLIO_TYPE.cf:
        return 'Curated Portfolio'
      case PORTFOLIO_TYPE.byop:
        return 'Portfolio Builder'
    }
  }

  const handleChange = async (data: any) => {
    const selectedIds = new Set(data.map((option) => option?.value?.address))
    options.forEach((option) => {
      if (!selectedIds.has(option?.value?.address)) {
        option.value.allocation = ''
      }
    })
    formik.values.select = data
    setSelectedCurrencies(data)
  }

  return (
    <div className={`dashboardUser ${type && parseInt(type) === PORTFOLIO_TYPE.legacy ? '' : 'pt-40'} undefined`}>
      <Container>
        <div className="fundForm commonBasecard">
          <div
            className="flex justify-between items-center text-white bg-no-repeat p-5 rounded-xl shadow-md bg-cover mb-5 "
            style={{
              backgroundImage: `url(${cardBg})`,
              backgroundSize: 'cover',
              borderRadius: '15px',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">{`Add ${renderSwitch(type)}`}</h3>
              </div>
            </div>
          </div>
          <form onSubmit={formik.handleSubmit}>
            <Row>
              <Col md={4} sm={12} xs={12}>
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
                  onChange={formik.handleChange}
                  value={formik.values.portfolioName}
                  onBlur={() => {
                    const trimmedValue = formik.values.portfolioName.trim()
                    formik.setFieldValue('portfolioName', trimmedValue)
                  }}
                  maxLength={30}
                  isInvalid={formik.touched.portfolioName && !!formik.errors.portfolioName}
                  error={
                    formik.errors.portfolioName && formik.touched.portfolioName ? (
                      <span className="error-message">{formik.errors.portfolioName}</span>
                    ) : null
                  }
                />
              </Col>
              <Col md={4} sm={12} xs={12}>
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
                  onBlur={() => {
                    const trimmedValue = formik.values.ticker.trim()
                    formik.setFieldValue('ticker', trimmedValue)
                  }}
                  value={formik.values.ticker}
                  isInvalid={formik.touched.ticker && !!formik.errors.ticker}
                  error={
                    formik.errors.ticker && formik.touched.ticker ? (
                      <span className="error-message">{formik.errors.ticker}</span>
                    ) : null
                  }
                />
              </Col>
              <Col md={4} sm={12} xs={12} className="mb-4">
                <label className="form-label" htmlFor="Asset">
                  Expected Returns
                </label>
                <CustomSelect
                  className="input_select"
                  isSearchable={false}
                  name="expectedReturns"
                  options={EXPECTED_RETURNS}
                  value={expectedReturns}
                  placeholder="Select Expected Returns"
                  onChange={(selectedOption: any) => {
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
              <Col md={4} sm={12} xs={12} className="mb-4 mb-md-5">
                <label className="form-label" htmlFor="Asset">
                  Search Asset
                </label>
                <CustomSelect
                  className="input_select"
                  options={options}
                  value={selectedCurrencies}
                  placeholder={
                    <span className="selectSearchicon">
                      <SearchIcon /> &nbsp;Search Asset Name
                    </span>
                  }
                  name="select"
                  onChange={(selectedOption) => {
                    handleChange(selectedOption)
                  }}
                  isMulti={true}
                  filterOption={(option, inputValue) =>
                    option.value.symbol.toLowerCase().includes(inputValue.toLowerCase())
                  }
                  isSearchable={true}
                  closeMenuOnSelect={selectedCurrencies.length + 1 === options.length}
                  error={
                    formik?.values?.select?.length <= 0 && formik.errors.select && formik.touched.select ? (
                      <span className="error-message">{formik.errors.select}</span>
                    ) : null
                  }
                />
              </Col>
              <Col xs={12}>
                {selectedCurrencies.length ? (
                  <Row>
                    {selectedCurrencies.map((item: any, index: number) => {
                      return (
                        <Col md={4} xs={12} key={item.value.symbol}>
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
                                  <img src={item.value.icon} alt="Currency-Logo" className="me-3 currencyLogo" />{' '}
                                  <h6>{item.value.symbol}</h6>
                                </div>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <InputCustom
                                id="name"
                                name="name"
                                required
                                min={0}
                                placeholder=""
                                onChange={(e) => {
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
                          </Row>
                        </Col>
                      )
                    })}
                  </Row>
                ) : (
                  ''
                )}
              </Col>
              <Col md={4} sm={12} xs={12}>
                {portfolioType === PORTFOLIO_TYPE.cf ? (
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
                  <div className="d-flex aling-items-center">
                    <h6 style={{ color: theme === 'dark' ? 'white' : 'black' }}>Transaction Fees {aumFee}%</h6>
                    <CustomTooltip
                      className="ms-1 rightIcon"
                      icon={<InfoIcon />}
                      text={`Transaction Fees: ${aumFee}% deducted on deposit, ${aumFee}% on withdrawal!`}
                    />
                  </div>
                )}
              </Col>
              <div className="d-flex  aling-items-center">
                <h6 style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                  Total Asset Allocation {totalAssetAllocation}%
                </h6>
              </div>
            </Row>
            <div className="text-center mt-4">
              <>
                {PORTFOLIO_TYPE.cf === portfolioType && walletAddress && <h5 className="text-danger mb-4">{msg}</h5>}
                <CommonButton
                  type="submit"
                  title="Confirm"
                  disabled={!walletAddress || (portfolioType === PORTFOLIO_TYPE.cf && !isProspectorNftPresent)}
                  buttonLoader={'createPortfolio'}
                />
              </>
            </div>
          </form>
        </div>
      </Container>
    </div>
  )
}

export default memo(AddPortfolioModal)
