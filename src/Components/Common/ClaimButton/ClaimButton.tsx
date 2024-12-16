import { Dispatch, memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import Web3 from 'web3'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../Redux/Actions/contract.action'
import { divideBigNumber } from '../../../Services/common.service'
import { ConfirmationModal } from '../CommonModal/ConfirmationModal/ConfirmationModal'
import toaster from '../Toast'
import './ClaimButton.scss'

function ClaimButton({ item }: any) {
  const { connector } = useAccount()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const [showConfModal, setShowConfModal] = useState(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const handleConfModalShow = () => setShowConfModal(true)
  const dispatch: Dispatch<any> = useDispatch()

  const claim = async () => {
    try {
      const obj: { user: string; amount: any; portfolioId: number } = {
        user: walletAddress,
        amount: item?.claimAmount?.$numberDecimal,
        portfolioId: item?.portfolioId,
      }
      let signature: any = await dispatch(callApiGetMethod('GET_TRANSACTION_SIGNATURE', obj, false, true, 'claim'))
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'claim',
          [
            [
              item?.portfolioId,
              item?.claimAmount?.$numberDecimal,
              item?.remainingAmount?.$numberDecimal,
              Web3.utils.toHex(item?._id),
              item?.signature,
            ],
            signature?.data?.discount,
            signature?.data?.signature,
            signature?.data?.timestamp,
          ],
          walletAddress,
          'orderExecution',
          'claim'
        )
      )
      if (result?.status) {
        toaster.success('Amount claimed successfully')
        handleConfModalClose()
      }
    } catch (error) {
      console.error('Error occurred during claim:', error)
      toaster.error('An error occurred while processing the claim')
    }
  }
  return (
    <>
      <button className="claimbtn" type="button" onClick={handleConfModalShow}>
        Claim
      </button>
      <ConfirmationModal
        text={`You have an approved claim request to claim ${item?.percentage / 100}% amount which is ${divideBigNumber(item?.claimAmount?.$numberDecimal, tokenDecimals) + ' ' + tokenSymbol
          }.\nAre you sure you want to claim?`}
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={claim}
        buttonLoader={'claim'}
      />
    </>
  )
}

export default memo(ClaimButton)
