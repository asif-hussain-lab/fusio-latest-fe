import { useFormik } from 'formik'
import cardBg from '../../../../Assets/Images/exploreCardBg.png'
import { Dispatch, memo, useCallback, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import * as yup from 'yup'
import { RedCrossIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractGetMethod, callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import {
  allowOnlyNumberWithDecimalsInput,
  convertWithDecimal,
  divideBigNumber,
  handleBigNumbers,
  multiplyBigDigitsWithDecimals,
} from '../../../../Services/common.service'
import { COUNTRY_TO_RESTRICT, DAO_DISCOUNT } from '../../../../Utils/Utils'
import { BASE_URI, TOKEN_ADDRESS } from '../../../../Utils/constant'
import CommonButton from '../../../Common/Button/CommonButton'
import InputCustom from '../../../Common/Inputs/InputCustom'
import MarqueeComponent from '../../../Common/Marquee/MarqueeComponent'
import SelectDropdown from '../../../Common/SelectDropdown/SelectDropdown'
import toaster from '../../../Common/Toast'
import './MptPage.scss'
import { userBalance } from '../../../../Redux/Slices/user.slice'
import CustomTooltip from '../../../Common/CustomTooltip/CustomTooltip'
import { InfoIcon } from '../../../../Assets/Images/Icons/SvgIcons'
import { ConfirmationModal } from '../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import RestrictionModal from '../../../Common/CommonModal/RestrictionModal'

const MptPage = () => {
  const { connector } = useAccount()
  const navigate = useNavigate()
  const country = useSelector((state: any) => state.user.country)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const balance = useSelector((state: any) => state.user.userBalance)
  const [minInvestment, setMinInvestment] = useState<any>()
  const [selectedPortfolios, setSelectedPortfolios] = useState<any>([])
  const [aumFees, setAumFees] = useState<number>(0)
  const [fuelFee, setFuelFee] = useState<any>('')
  const [discount, setDiscount] = useState<any>(0)
  const dispatch: Dispatch<any> = useDispatch()
  const [width, setWidth] = useState<number>(0)
  const [show, setShow] = useState<boolean>(false)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)

  const handleClose = useCallback(() => {
    setShow(false)
  }, [])
  const handleShow = () => setShow(true)
  const handleDisclaimerClose = () => setShowDisclaimer(false)

  useEffect(() => {
    if (country === COUNTRY_TO_RESTRICT) {
      setShowDisclaimer(true)
    }
  }, [])

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
    getMinimumUsdc()
    getWindowDimensions()
    getAumFee()
    getFuelFee()
  }, [])

  useEffect(() => {
    if (walletAddress) {
      getDaoDiscount()
    } else {
      setDiscount(0)
    }
  }, [walletAddress])

  const getDaoDiscount = async () => {
    const result: any = await dispatch(callApiGetMethod('GET_DAO_NFT_DISCOUNT', { user: walletAddress }, false))
    if (result?.success) {
      setDiscount(result?.data?.discount / 100)
    }
  }

  const validationSchema = yup.object({
    investmentAmount: yup
      .number()
      .required('Required field*')
      .min(minInvestment, `Investment amount must be at least ${minInvestment}`),
    select: yup.array().min(1, 'Required field*'),
  })

  const formik = useFormik({
    initialValues: {
      investmentAmount: '',
      select: [],
    },
    onSubmit: (values) => {
      handleShow()
    },
    validationSchema,
  })

  const getMinimumUsdc = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumUsdc', [], 'portfolio', false))
    if (result) {
      formik.setFieldValue('amount', divideBigNumber(result, tokenDecimals))
      setMinInvestment(divideBigNumber(result, tokenDecimals))
    }
  }

  const getUserBalance = useCallback(async () => {
    if (walletAddress) {
      let balance: any = ''
      balance = await dispatch(callContractGetMethod('balanceOf', [walletAddress], 'dynamic', false, TOKEN_ADDRESS))
      dispatch(userBalance(balance))
    }
  }, [walletAddress])

  const getTrimmedValue = (value: any) => {
    try {
      let newValue: any = value?.toString()
      newValue = value?.split('.')[0]
      return newValue
    } catch (error) {
      console.log('error in getTrimmedValue Method :>> ', error)
      return null
    }
  }

  const getDiscountAndSignForMPT = async () => {
    let discountArr: any = []
    let signatureArr: any = []
    let timestampArr: any = []
    await Promise.all(
      selectedPortfolios?.map(async (item, index) => {
        let amount: any = convertWithDecimal(formik.values.investmentAmount, tokenDecimals)
        let buyAmount: any = multiplyBigDigitsWithDecimals(amount, String(item?.value?.investAmount))
        let newAmount = getTrimmedValue(buyAmount)
        let signature: any = await dispatch(
          callApiGetMethod(
            'GET_TRANSACTION_SIGNATURE',
            { user: walletAddress, amount: newAmount, portfolioId: item?.value?.portfolioId },
            false,
            true,
            'investInMPT'
          )
        )
        if (signature?.success) {
          signatureArr[index] = signature?.data?.signature
          discountArr[index] = signature?.data?.discount
          timestampArr[index] = signature?.data?.timestamp
        } else {
          console.log('signature not found')
        }
      })
    )
    return { signatureArr, discountArr, timestampArr }
  }

  const investInMPT = async () => {
    let allocations: any = []
    let portfolioIds: any = []

    let totalAllocation: number = 0
    let isAllocationZero = false

    selectedPortfolios?.length > 0 &&
      selectedPortfolios?.map((item, index) => {
        if (item?.value?.investAmount > 0) {
          allocations[index] = parseInt(multiplyBigDigitsWithDecimals(String(item?.value?.investAmount), '100'))
          portfolioIds[index] = item?.value?.portfolioId
          totalAllocation += Number(item?.value?.investAmount)
        } else {
          isAllocationZero = true
        }
        return isAllocationZero
      })
    let check = selectedPortfolios.every(checkAllocationValue)
    if (selectedPortfolios?.length === 0) {
      return toaster.error('Please select atleast one portfolio')
    } else if (isAllocationZero) {
      return toaster.error('Allocations should be greater than 0')
    } else if (totalAllocation !== 100) {
      return toaster.error('Allocations must be 100%')
    } else if (!check) {
      toaster.error(
        `Allocation amount for each portfolio must be greater than or equal to ${minInvestment} ${tokenSymbol}, kindly check the allocations you have entered`
      )
    } else {
      const { signatureArr, discountArr, timestampArr } = await getDiscountAndSignForMPT()
      let totalPortfolios = selectedPortfolios?.length
      let investedAmount = handleBigNumbers(
        convertWithDecimal(
          formik.values.investmentAmount === '' ? '0.0' : formik.values.investmentAmount,
          tokenDecimals
        ),
        totalPortfolios * fuelFee
      )
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'depositOnMPT',
          [investedAmount, portfolioIds, allocations, discountArr, BASE_URI, signatureArr, timestampArr],
          walletAddress,
          'orderExecution',
          'investInMPT'
        )
      )
      if (result?.status) {
        formik.resetForm()
        handleClose()
        setSelectedPortfolios('')
        navigate('/dashboard?tab=myorders')
        getUserBalance()
        toaster.success('Successfully Invested in MPT')
      } else {
        console.log('error occured')
      }
    }
  }

  const handleAllocationChange = (index, newAllocation) => {
    if (newAllocation < 0) {
      toaster.error('Allocation must be greater than 0')
    } else {
      setSelectedPortfolios((data) => {
        const updatedAllocation = [...data]
        updatedAllocation[index].value.investAmount = newAllocation
        return updatedAllocation
      })
    }
  }

  const checkAllocationValue = (item: any) => {
    if ((item?.value?.investAmount * parseFloat(formik.values.investmentAmount)) / 100 >= minInvestment) {
      return true
    } else {
      return false
    }
  }

  const handleDelete = (index: number) => {
    setSelectedPortfolios((data) => {
      const updatedData = [...data]
      updatedData.splice(index, 1)
      return updatedData
    })
  }

  const getAumFee = async () => {
    const result: any = await dispatch(callContractGetMethod('platformFees', [], 'portfolio', false))
    if (result) {
      setAumFees(result / 100)
    }
  }

  const getFuelFee = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumCryptoFuelFees', [], 'portfolio', false))
    if (result) {
      setFuelFee(result)
    }
  }

  return (
    <div className="commonContentModal pt-40 pb-40">
      <Container>
        <div className="fundForm commonBasecard mrq">
          <div
            className="flex justify-between items-center text-white bg-no-repeat p-5 rounded-xl shadow-md bg-cover mb-4"
            style={{
              backgroundImage: `url(${cardBg})`,
              backgroundSize: 'cover',
              borderRadius: '15px',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">{'Portfolio Manager'}</h3>
                <h6 className="font-semibold mt-2 ">
                  {' '}
                  {`DAO NFT holders will get upto ${DAO_DISCOUNT}% discount on AUM Fees*`}
                </h6>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <Row>
              <Col xs={12} md={4}>
                <InputCustom
                  id="investmentAmount"
                  name="investmentAmount"
                  label="Investment Amount (USDC)"
                  placeholder="Enter Amount"
                  maxLength={20}
                  min={0}
                  nativeCurrency
                  onChange={(e) => {
                    let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                    isValid && formik.handleChange(e)
                  }}
                  value={formik.values.investmentAmount}
                  isInvalid={formik.touched.investmentAmount && !!formik.errors.investmentAmount}
                  error={
                    formik.errors.investmentAmount && formik.touched.investmentAmount ? (
                      <span className="error-message">{formik.errors.investmentAmount}</span>
                    ) : null
                  }
                />
              </Col>
              <Col xs={12} md={4} className="mb-5">
                <label className="form-label" htmlFor="Asset">
                  Search Portfolio
                </label>
                <SelectDropdown
                  name="select"
                  data={selectedPortfolios}
                  callback={(selectedPortfolios) => {
                    formik.values.select = selectedPortfolios
                    setSelectedPortfolios(selectedPortfolios)
                  }}
                  isMulti
                  closeMenuOnSelect={false}
                  error={
                    formik.values.select.length <= 0 && formik.errors.select && formik.touched.select ? (
                      <span className="error-message">{formik.errors.select}</span>
                    ) : null
                  }
                />
              </Col>
              <Col xs={12} md={4}>
                {selectedPortfolios.length ? (
                  <div>
                    <Row>
                      {selectedPortfolios.map((item: any, index: number) => {
                        return (
                          <Col xs={12} key={item?.value?._id}>
                            {index < (width > 767 ? 3 : 1) && (
                              <Row>
                                <Col xs={6}>
                                  <label className="form-label" htmlFor="Asset">
                                    Portfolio
                                  </label>
                                </Col>
                                <Col xs={4}>
                                  <label className="form-label" htmlFor="Asset">
                                    Allocation %
                                  </label>
                                </Col>
                              </Row>
                            )}
                            <Row key={item?.value?._id}>
                              <Col xs={6}>
                                <div className="customInput">
                                  <div className="form-control d-flex align-items-center">
                                    <h6>{item?.value?.portfolioName}</h6>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <InputCustom
                                  id="name"
                                  name="name"
                                  min="0"
                                  placeholder=""
                                  onChange={(e) => {
                                    if (e.target.value <= 100) {
                                      let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                                      isValid && handleAllocationChange(index, e.target.value)
                                    }
                                  }}
                                  value={item?.value?.investAmount}
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
                  </div>
                ) : (
                  ''
                )}
              </Col>
              <Col xs={12}>
                <div className="d-flex flex-column">
                  <h6 style={{ color: 'black' }}>
                    Available Balance:{' '}
                    <span>
                      {divideBigNumber(balance, tokenDecimals)} {tokenSymbol}
                    </span>
                  </h6>
                  <h6 className="d-flex" style={{ color: 'black' }}>
                    Transaction Fees {aumFees}%
                    <CustomTooltip
                      className="ms-1"
                      icon={<InfoIcon />}
                      text={`Transaction Fees: ${aumFees}% deducted on deposit, ${aumFees}% on withdrawal for each portfolio!`}
                    />
                  </h6>
                  {discount > 0 ? (
                    <h6 className="discount_text d-flex">
                      You are a DAO NFT Holder, you will get {discount}% discount on AUM Fees.{' '}
                      <CustomTooltip
                        className="ms-1"
                        icon={<InfoIcon />}
                        text={`You will get ${discount}% discount on deposit, ${discount}% discount on withdrawal!`}
                      />
                    </h6>
                  ) : (
                    ''
                  )}
                </div>
              </Col>
            </Row>
            <div className="text-center mt-5">
              <CommonButton type="submit" title="Invest" buttonLoader={'investInMPT'} disabled={!walletAddress} />
            </div>
          </form>
        </div>
      </Container>
      <ConfirmationModal
        text={`You're investing ${formik.values.investmentAmount} ${tokenSymbol} and a fee of ${divideBigNumber(
          fuelFee,
          tokenDecimals,
          false
        )} ${tokenSymbol} will be charged for investing in each portfolio. So, a total of ${divideBigNumber(
          handleBigNumbers(
            convertWithDecimal(
              formik.values.investmentAmount === '' ? '0.0' : formik.values.investmentAmount,
              tokenDecimals
            ),
            selectedPortfolios?.length * fuelFee
          ),
          tokenDecimals,
          false
        )} ${tokenSymbol} will be deducted from your wallet.`}
        show={show}
        handleClose={handleClose}
        callBack={investInMPT}
        buttonLoader="investInMPT"
      />

    </div>
  )
}

export default memo(MptPage)
