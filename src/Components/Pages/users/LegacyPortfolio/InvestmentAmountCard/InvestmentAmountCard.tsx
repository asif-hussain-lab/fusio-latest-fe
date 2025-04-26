import { useFormik } from 'formik'
import { Dispatch, useCallback, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import * as Yup from 'yup'
import { callApiGetMethod } from '../../../../../Redux/Actions/api.action'
import { callContractGetMethod, callContractSendMethod } from '../../../../../Redux/Actions/contract.action'
import { userBalance } from '../../../../../Redux/Slices/user.slice'
import {
  allowOnlyNumberWithDecimalsInput,
  convertWithDecimal,
  divideBigNumber,
  divideWithDecimal,
  fixedToDecimal,
  handleBigNumbers,
} from '../../../../../Services/common.service'
import {
  DAO_DISCOUNT, WITHDRAW_REQUEST_STATUS
} from '../../../../../Utils/Utils'
import { BASE_URI, TOKEN_ADDRESS } from '../../../../../Utils/constant'
import CommonButton from '../../../../Common/Button/CommonButton'
import CommonLink from '../../../../Common/CommonLink/CommonLink'
import { ConfirmationModal } from '../../../../Common/CommonModal/ConfirmationModal/ConfirmationModal'
import WithdrawModal from '../../../../Common/CommonModal/WithdrawModal/WithdrawModal'
import InputCustom from '../../../../Common/Inputs/InputCustom'
import MarqueeComponent from '../../../../Common/Marquee/MarqueeComponent'
import toaster from '../../../../Common/Toast'
import './InvestmentAmountCard.scss'
import CustomTooltip from '../../../../Common/CustomTooltip/CustomTooltip'
import { InfoIcon } from '../../../../../Assets/Images/Icons/SvgIcons'
import { InvestmentAmountCardProps } from '../../../../../Utils/Interfaces'

const InvestmentAmountCard = (props: InvestmentAmountCardProps) => {
  const { connector } = useAccount()
  const navigate = useNavigate()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const balance = useSelector((state: any) => state.user.userBalance)
  const [minValue, setMinValue] = useState(0)
  const [discount, setDiscount] = useState<any>(0)
  const dispatch: Dispatch<any> = useDispatch()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')
  const [show, setShow] = useState<boolean>(false)
  const [showConfModal, setShowConfModal] = useState<boolean>(false)
  const [fuelFee, setFuelFee] = useState<string>('')

  const handleClose = useCallback(() => {
    setShow(false)
  }, [])

  const handleShow = () => setShow(true)

  const handleCloseConfModal = useCallback(() => {
    setShowConfModal(false)
  }, [])

  const handleShowConfModal = () => setShowConfModal(true)

  const inputSchema = Yup.object().shape({
    investAmount: Yup.number()
      .typeError('Amount must be a number')
      .required('Required field*')
      .min(minValue, `Investment Amount must be greater than or equal to  ${minValue} ${tokenSymbol}!`),
  })
  const formik = useFormik({
    initialValues: {
      investAmount: '',
    },
    validationSchema: inputSchema,
    onSubmit: async (values) => {
      handleShowConfModal()
    },
  })

  const getUserBalance = useCallback(async () => {
    if (walletAddress) {
      let balance: any = ''
      balance = await dispatch(callContractGetMethod('balanceOf', [walletAddress], 'dynamic', false, TOKEN_ADDRESS))
      dispatch(userBalance(balance))
    }
  }, [walletAddress])

  const getDaoDiscount = async () => {
    const result: any = await dispatch(callApiGetMethod('GET_DAO_NFT_DISCOUNT', { user: walletAddress }, false))
    if (result?.success) {
      setDiscount(result?.data?.discount / 100)
    }
  }

  useEffect(() => {
    walletAddress && getMinimumUsdc()
    walletAddress && getUserBalance()
    walletAddress && getDaoDiscount()
    getFuelFee()
  }, [walletAddress])

  const getFuelFee = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumCryptoFuelFees', [], 'portfolio', false))
    if (result) {
      setFuelFee(result)
    }
  }

  const invest = async () => {
    let amount: any = handleBigNumbers(
      convertWithDecimal(formik.values.investAmount === '' ? '0.0' : formik.values.investAmount, tokenDecimals),
      fuelFee
    )

    if (parseFloat(formik.values.investAmount) < minValue) {
      return toaster.error(`Minimum investment required is ${minValue} ${tokenSymbol}`)
    } else if (parseFloat(formik.values.investAmount) > parseFloat(divideBigNumber(balance, tokenDecimals))) {
      return toaster.error('Insufficient balance!')
    } else {
      const obj: { user: string; amount: any; portfolioId: any } = {
        user: walletAddress,
        amount: amount,
        portfolioId: id,
      }
      let signature: any = await dispatch(callApiGetMethod('GET_TRANSACTION_SIGNATURE', obj, false, true, 'invest'))
      if (signature?.data?.signature) {
        let provider = await connector?.getProvider()
        let result: any = await dispatch(
          callContractSendMethod(
            provider,
            'deposit',
            [id, amount, signature?.data?.discount, BASE_URI, signature?.data?.signature, signature?.data?.timestamp],
            walletAddress,
            'orderExecution',
            'invest'
          )
        )
        if (result?.status) {
          formik.resetForm()
          handleCloseConfModal()
          getUserBalance()
          toaster.success('Investment done successfully')
          navigate('/dashboard?tab=myorders')
        }
      } else {
        console.log('signature not found')
      }
    }
  }

  const getMinimumUsdc = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumUsdc', [], 'portfolio', false))
    if (result) {
      setMinValue(divideWithDecimal(result.toString(), tokenDecimals))
    }
  }

  const renderClass = useCallback(
    (data: any) => {
      const currentValue = fixedToDecimal(data?.portfolioCurruntValue) || '0'
      const investedAmount = divideBigNumber(data?.invesedAmount?.$numberDecimal, tokenDecimals) ?? '0'
      if (parseFloat(currentValue) > parseFloat(investedAmount)) {
        return 'green_text'
      } else if (currentValue < investedAmount) {
        return 'red_text'
      } else {
        return ''
      }
    },
    [tokenDecimals]
  )

  return (
    <div className="investment_card w-100">
      <h3 className="mb-5">Investment Amount</h3>
      {/* <MarqueeComponent text={`DAO NFT holders will get upto ${DAO_DISCOUNT}% discount on AUM Fees*`} /> */}
      <form onSubmit={formik.handleSubmit}>
        <Row>
          <Col xs={12}>
            <div className='whiteInput'>
              <InputCustom
                id="investAmount"
                name="investAmount"
                label="Enter Amount (USDC)"
                placeholder="Enter Amount"
                classLabel="clrWhite"
                nativeCurrency
                onChange={(e: any) => {
                  let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                  isValid && formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                value={formik.values.investAmount}
                isInvalid={formik.touched.investAmount && !!formik.errors.investAmount}
                error={
                  formik.errors.investAmount && formik.touched.investAmount ? (
                    <span className="error-message">{formik.errors.investAmount}</span>
                  ) : null
                }
              />
            </div>
          </Col>
        </Row>
        <div className="d-flex flex-column">
          <h4>
            Fuel Fees:{' '}
            <span>
              {divideBigNumber(fuelFee, tokenDecimals, false)} {tokenSymbol}
            </span>
          </h4>
          <h4>
            Transaction Fees: <span>{props?.aumFees ? props?.aumFees / 100 : 0}% </span>
          </h4>
          {discount > 0 ? (
            <h5 className="discount_text d-flex">
              You are a DAO NFT Holder, you will get {discount}% discount on AUM Fees.{' '}
              <CustomTooltip
                className="ms-1"
                icon={<InfoIcon />}
                text={`You will get ${discount}% discount on deposit, ${discount}% discount on withdrawal!`}
              />
            </h5>
          ) : (
            ''
          )}
        </div>

        <h4>
          Available Balance:{' '}
          <span>
            {divideBigNumber(balance, tokenDecimals)} {tokenSymbol}
          </span>
        </h4>
        <div className="invest_btn">
          <div className="groupBtn mt-5 pt-md-4 d-flex justify-content-center">
            <CommonButton
              title="Invest"
              className="me-3"
              type="submit"
              disabled={!walletAddress || props?.disabled}
              buttonLoader={'invest'}
            />
            {props?.portfolio?.portfolioCurruntValue > 0 && (
              <CommonButton
                title="Withdraw"
                className="ms-3"
                type="button"
                onClick={handleShow}
                disabled={
                  !walletAddress ||
                  props?.pendingWithdrawRequest?.status === WITHDRAW_REQUEST_STATUS.APPROVED ||
                  props?.pendingWithdrawRequest?.status === WITHDRAW_REQUEST_STATUS.INPROGRESS ||
                  props?.pendingRebalanceRequest ||
                  props?.pendingInvestRequest
                }
              />
            )}
          </div>
          {props?.disabled && !props?.pendingWithdrawRequest && !props?.pendingRebalanceRequest && (
            <h6 className="text-warning mt-3">This Portfolio is disabled*</h6>
          )}
          {props?.portfolio?.portfolioCurruntValue > 0 && props?.pendingInvestRequest && (
            <h6 className="text-warning mt-3">
              You have pending invest request. If you want to withdraw, please wait for execution or cancel that.
            </h6>
          )}
          {props?.pendingRebalanceRequest && (
            <h6 className="text-warning mt-3">
              You have pending rebalance request. Please wait for approval or cancel that.
            </h6>
          )}
          {(props?.pendingWithdrawRequest?.status === WITHDRAW_REQUEST_STATUS.INPROGRESS ||
            props?.pendingWithdrawRequest?.status === WITHDRAW_REQUEST_STATUS.PENDING) && (
            <h6 className="text-warning mt-3">
              You have pending withdraw requests. If you want to invest, please wait for execution or cancel that.
            </h6>
          )}
        </div>
      </form>
      {props?.pendingWithdrawRequest?.status === WITHDRAW_REQUEST_STATUS.APPROVED && (
        <h6 className="text-warning mt-3">
          You have pending claim requests. Please{' '}
          <span>
            <CommonLink text="claim" to={`/dashboard?tab=withdrawRequests`} className="mt-3 mt-md-0 pb-3 pb-md-0" />
          </span>{' '}
          them first before investing.
        </h6>
      )}
      <ConfirmationModal
        text={`You're investing ${formik.values.investAmount} ${tokenSymbol} and a fee of ${divideBigNumber(
          fuelFee,
          tokenDecimals,
          false
        )} ${tokenSymbol} will be charged. So, a total of ${divideBigNumber(
          handleBigNumbers(
            convertWithDecimal(formik.values.investAmount === '' ? '0.0' : formik.values.investAmount, tokenDecimals),
            fuelFee
          ),
          tokenDecimals,
          false
        )} ${tokenSymbol} will be deducted from your wallet.`}
        show={showConfModal}
        handleClose={handleCloseConfModal}
        callBack={invest}
        buttonLoader="invest"
      />
      <WithdrawModal show={show} handleClose={handleClose} portfolio={props?.portfolio} renderClass={renderClass} />
    </div>
  )
}

export default InvestmentAmountCard
