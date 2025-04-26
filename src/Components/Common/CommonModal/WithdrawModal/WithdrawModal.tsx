import { Dispatch, memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { allowOnlyNumberWithDecimalsInput, divideBigNumber, fixedToDecimal } from '../../../../Services/common.service'
import toaster from '../../../Common/Toast'
import CommonButton from '../../Button/CommonButton'
import RangeSlider from '../../RangeSlider/RangeSlider'
import CommonModal from '../CommonModal'
import './WithdrawModal.scss'
import InputCustom from '../../Inputs/InputCustom'
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { WithdrawModalProps } from '../../../../Utils/Interfaces'
import { useTheme } from '../../../../Utils/ThemeContext'

const WithdrawModal = ({ show, handleClose, portfolio, renderClass }: WithdrawModalProps) => {
  const navigate = useNavigate()
  const { connector } = useAccount()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const userBalance = useSelector((state: any) => state.user.userBalance)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
  const [previousAmount, setPreviousAmount] = useState<number>(0)
  const dispatch: Dispatch<any> = useDispatch()

  useEffect(() => {
    show && getPendingRequests()
  }, [show])
  const handleModalClose = () => {
    handleClose()
    setWithdrawAmount(0)
  }

  const getPendingRequests = async () => {
    let result: any = await dispatch(
      callApiGetMethod(
        'GET_PENDING_WITHDRAW_REQUESTS',
        { user: walletAddress, portfolioId: portfolio?.portfolioId },
        false
      )
    )
    if (result?.success) {
      result?.data && setWithdrawAmount(result?.data?.percentage / 100)
      result?.data && setPreviousAmount(result?.data?.percentage / 100)
    }
  }

  const withdraw = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'requestWithdraw',
        [withdrawAmount * 100, portfolio?.portfolioId],
        walletAddress,
        'orderExecution',
        'confirmWithdraw'
      )
    )
    if (result?.status) {
      toaster.success('Withdraw request submitted successfully')
      navigate('/dashboard?tab=withdrawRequests')
      handleModalClose()
    }
  }
  const handleChange = (newValue: number) => {
    setWithdrawAmount(newValue)
  }

  const amountArray = [
    {
      label: '25%',
      value: 25,
    },
    {
      label: '50%',
      value: 50,
    },
    {
      label: '75%',
      value: 75,
    },
    {
      label: '100%',
      value: 100,
    },
  ]

  const { theme, toggleTheme } = useTheme()

  return (
    <CommonModal
      heading="Create Withdraw Request"
      show={show}
      handleClose={handleModalClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="withdrawModal"
    >
      <div className="commonContentModal">
        <h4>{portfolio?.portfolioName}</h4>
        <h6 className="mt-4">Select Withdraw Amount</h6>
        <RangeSlider min={0} max={100} step={1} value={withdrawAmount} onChange={handleChange} />

        <div className="withdrawBalance d-flex justify-content-between">
          <h6>
            Selected Amount: <span>{withdrawAmount}%</span>
          </h6>
          {previousAmount ? (
            <h6>
              Pending Withdraw Request: <span className="yellow_text">{previousAmount}%</span>
            </h6>
          ) : (
            ''
          )}
        </div>

        <div className="withdrawBalance mt-4">
          <div className="d-flex justify-content-between">
            <h6>
              Current Portfolio Value:{' '}
              <span className={renderClass(portfolio)}>
                {fixedToDecimal(portfolio?.portfolioCurruntValue)} {tokenSymbol}
              </span>
            </h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>
              Transaction Fee: <span>{portfolio?.aumFees / 100}%</span>
            </h6>
          </div>
          <div className="mt-4">
            <h6>Enter withdraw amount:</h6>

            <div className="d-flex justify-content-between whiteInput">
              <InputCustom
                placeholder="Enter Amount"
                onChange={(e) => {
                  if (e.target.value <= 100) {
                    let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                    isValid && setWithdrawAmount(e.target.value)
                  }
                }}
                value={withdrawAmount}
              >
                <span className="allocP" style={{ color: theme === 'dark' ? 'black' : 'white' }}>
                  %
                </span>
              </InputCustom>
              <Row>
                {amountArray.map((data) => (
                  <Col xs={3} key={data?.label}>
                    <span
                      className={`createBox ${data?.value === withdrawAmount ? 'active' : ''}`}
                      onClick={() => {
                        setWithdrawAmount(data?.value)
                      }}
                    >
                      {data?.label}{' '}
                    </span>
                  </Col>
                ))}
              </Row>
            </div>
          </div>

          <h6>
            Wallet Balance:{' '}
            <span>
              {divideBigNumber(userBalance, tokenDecimals)} {tokenSymbol}
            </span>
          </h6>
          <div className="btnGroup text-center mt-5 pt-xl-4">
            <CommonButton
              title="Confirm Withdraw"
              onClick={withdraw}
              disabled={!withdrawAmount}
              buttonLoader={'confirmWithdraw'}
            />
          </div>
        </div>
      </div>
    </CommonModal>
  )
}

export default memo(WithdrawModal)
