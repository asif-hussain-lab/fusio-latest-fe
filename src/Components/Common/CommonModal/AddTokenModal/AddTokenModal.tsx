import { Dispatch, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractSendMethod, validateAddress } from '../../../../Redux/Actions/contract.action'
import { buttonLoader } from '../../../../Redux/Slices/loader.slice'
import { fixedToDecimal } from '../../../../Services/common.service'
import CommonButton from '../../Button/CommonButton'
import InputCustom from '../../Inputs/InputCustom'
import toaster from '../../Toast'
import CommonModal from '../CommonModal'
import './AddTokenModal.scss'
import PercentageChange from '../../PercentageChange/PercentageChange'
import { ModalProps } from '../../../../Utils/Interfaces'

export const AddTokenModal = ({ show, handleClose }: ModalProps) => {
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user?.walletAddress)
  const { connector } = useAccount()
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenDetails, setTokenDetails] = useState<any>()

  const handleModalClose = () => {
    setTokenAddress('')
    setTokenDetails('')
    handleClose()
  }
  const fetchTokenDetails = async (e: any) => {
    e.preventDefault()
    dispatch(buttonLoader({ fetchToken: true }))
    let validAddress: any = await dispatch(validateAddress(tokenAddress, 'contract'))
    if (validAddress) {
      let result: any = await dispatch(callApiGetMethod('GET_TOKEN_INFO', { token: tokenAddress }, false))

      if (result?.success) {
        setTokenDetails(result?.data)
      }
    } else {
      toaster.error('Invalid currency address')
    }
    dispatch(buttonLoader({ fetchToken: false }))
  }

  const getTokenStatus = async () => {
    try {
      let result: any = await dispatch(
        callApiGetMethod('GET_TOKEN_STATUS', { token: tokenAddress }, false, true, 'Whitelist')
      )
      let status: any = null
      if (result?.success) {
        if (result?.data) {
          status = true
        } else status = false
      }
      return status
    } catch (error) {
      console.log('Error in getTokenStatus:', error)
    }
  }

  const whitelistCurrency = async () => {
    let tokenStatus: any = await getTokenStatus()
    if (!tokenStatus) {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'addWhitelistCurrency',
          [[tokenAddress]],
          walletAddress,
          'portfolio',
          'Whitelist'
        )
      )
      if (result?.status) {
        handleModalClose()
        toaster.success('Currency whitelisted successfully')
      } else {
        console.log('error occured')
      }
    } else {
      toaster.error('Currency is already whitelisted')
    }
  }

  return (
    <CommonModal
      heading="Add Token for Whitelisting"
      show={show}
      handleClose={handleModalClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="addTokenModal"
    >
      <div className="commonContentModal">
        <form onSubmit={fetchTokenDetails}>
          <Row>
            <Col xs={12}>
              <InputCustom
                id="token"
                name="token"
                label="Token Contract Address"
                placeholder="Enter Token Address"
                maxLength="43"
                required
                onChange={(e: any) => setTokenAddress(e.target.value)}
                value={tokenAddress}
              />
            </Col>
          </Row>
          <div className="text-center mt-4">
            <CommonButton
              type="submit"
              title="Fetch Token"
              disabled={tokenAddress === tokenDetails?.address}
              buttonLoader={'fetchToken'}
            />
          </div>
        </form>
        {tokenDetails ? (
          <>
            <div className="my-4 my-md-5">
              <hr />
            </div>
            <div className="TokenListdetails mt-4">
              <h5>Token Details</h5>
              <h6 className="my-4">
                <img src={tokenDetails?.icon} alt="token icon" className="currencyLogo" /> {tokenDetails?.name}
              </h6>
              <ul className="d-flex align-items-center justify-content-between">
                <li>
                  <p>Symbol : {tokenDetails?.symbol}</p>
                </li>
                <li>
                  <p className="tokenPrice">
                    Price :
                    {
                      <>
                        ${fixedToDecimal(tokenDetails?.price)} (
                        <PercentageChange
                          changeStatus={tokenDetails?.priceState?.priceStatus}
                          percentageChange={tokenDetails?.priceState?.percentageChange}
                        />
                        )
                      </>
                    }
                  </p>
                </li>
              </ul>
              <div className="text-center mt-5">
                <CommonButton type="button" title="Whitelist" onClick={whitelistCurrency} buttonLoader={'Whitelist'} />
              </div>
            </div>
          </>
        ) : (
          ''
        )}
      </div>
    </CommonModal>
  )
}
