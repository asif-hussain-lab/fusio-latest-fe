import moment from 'moment'
import { Dispatch, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { callContractSendMethod } from '../../../Redux/Actions/contract.action'
import {
  divideBigNumber,
  divideWithDecimal,
  renderOrderStatusClassName,
  renderRebalnceStatusClassName,
  renderRequestStatusClassName,
} from '../../../Services/common.service'
import { NftCardProps } from '../../../Utils/Interfaces'
import { NFT_STATUS, ORDER_STATUS, REBALANCE_REQUEST_STATUS, WITHDRAW_REQUEST_STATUS } from '../../../Utils/Utils'
import { IMAGES_URL } from '../../../Utils/constant'
import toaster from '../../Common/Toast'
import ClaimButton from '../ClaimButton/ClaimButton'
import { ConfirmationModal } from '../CommonModal/ConfirmationModal/ConfirmationModal'
import CountdownTimer from '../CountdownTimer/CountdownTimer'
import './NftCard.scss'
import cardBg from '../../../Assets/Images/exploreCardBg.png'
import profileImg from '../../../Assets/Images/profile.png'

const NftCard = ({
  item,
  className,
  rebalnceMyPortfolioFee,
  isNftCard,
  isOrderCard,
  isWithdrawRequest,
  isRebalanceRequests,
}: NftCardProps) => {
  const dispatch: Dispatch<any> = useDispatch()
  const { connector } = useAccount()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [showConfModal, setShowConfModal] = useState(false)
  const handleConfModalClose = () => setShowConfModal(false)
  const [activeButton, setActiveButton] = useState<string>('')

  const cancelInvestRequest = async () => {
    try {
      const obj: { portfolioId: number; investId?: number; user?: string; orderId: string } = {
        portfolioId: item?.portfolioId,
        investId: item?.investId,
        user: walletAddress,
        orderId: item?._id,
      }
      let burnNftResult: any = await dispatch(callApiGetMethod('GET_BURN_USER_NFT', obj, false, true, 'cancelrequest'))
      let signature: any = await dispatch(
        callApiGetMethod('GET_CANCEL_INVEST_SIGNATURE', obj, false, true, 'cancelrequest')
      )
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'cancelInvest',
          [item?.portfolioId, item?.investId, burnNftResult?.data, signature?.data?.signature],
          walletAddress,
          'orderExecution',
          'cancelrequest'
        )
      )
      if (result?.status) {
        toaster.success('Investment cancel successfully')
        handleConfModalClose()
      }
    } catch (error) { 
      console.log("Error in cancel invest request: ",error)
    }
  }

  const cancelWithdrawRequest = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'cancelRequestWithdraw',
        [item?.portfolioId],
        walletAddress,
        'orderExecution',
        'cancelrequest'
      )
    )
    if (result?.status) {
      toaster.success('Withdraw Request cancel successfully')
      handleConfModalClose()
    }
  }

  const rebalanceMyPortfolio = async () => {
    let provider = await connector?.getProvider()
    let result: any = await dispatch(
      callContractSendMethod(
        provider,
        'reBalanceMyPortfolio',
        [item?.portfolioId, rebalnceMyPortfolioFee, 0],
        walletAddress,
        'orderExecution',
        'rebalancePortfolio'
      )
    )
    if (result?.status) {
      toaster.success('Portfolio rebalancing request submitted successfully')
      handleConfModalClose()
    } else {
      console.log('error occured')
    }
  }

  return (
    <div
      className={`nftcard ${item?.status === NFT_STATUS.BURNED ? 'soldOut soldOutred' : ''}${
        item?.status === NFT_STATUS.TRANSFERRED ? 'soldOut' : ''
      } ${className || ''}`}
    >
      {item?.status === NFT_STATUS.BURNED && (
        <div className="soldOutcard">
          <p>{item?.status}</p>
        </div>
      )}

      {item?.status === NFT_STATUS.TRANSFERRED && (
        <div className="soldOutcard">
          <p>{item?.status}</p>
        </div>
      )}
      {isNftCard && (
        <span className="myNftImg">
          <img src={`${IMAGES_URL}nftart2.png`} alt="img" />
        </span>
      )}
      <div className="nftcard_sec">
        <div className="items-center gap-3" style={{ display: 'flex' }}>
          <img
            className="w-[50px] rounded-full border-[1px] border-[yellow]"
            style={{ width: '58.93px', height: '58.93px' }}
            src={profileImg}
            alt="Img"
          />
          <div className="flex flex-col mt-3">
            <h3 style={{ marginBottom: '0px' }}>{item?.portfolioName}</h3>
            <div className="p-status">
              {isOrderCard && <p className={renderOrderStatusClassName(item?.status)}>{item?.status}</p>}
              {isWithdrawRequest && <p className={renderRequestStatusClassName(item?.status)}>{item?.status}</p>}
              {isRebalanceRequests && <p className={renderRebalnceStatusClassName(item?.status)}>{item?.status}</p>}
            </div>
          </div>
        </div>

        <div className="nft_content">
          {isNftCard && (
            <>
              <div className="w-100 mb-3">
                <div className="nft_data">
                  <p>USD Value:</p>
                  <h6>
                    $
                    {item?.status === NFT_STATUS.BURNED && item?.status === NFT_STATUS.TRANSFERRED
                      ? '0'
                      : item?.usdValue}
                  </h6>
                </div>
              </div>
              <div className="w-100 mb-3">
                <div className="nft_data">
                  <p>Invested Amount:</p>
                  <h6>
                    {divideBigNumber(item?.investmentInfo?.invesedAmount?.$numberDecimal, tokenDecimals)} {tokenSymbol}
                  </h6>
                </div>
              </div>
              <div className="w-100">
                <div className="nft_data">
                  <p>Investment Share:</p>
                  <h6>
                    {!item?.usdValue ||
                    !item?.totalValue ||
                    item?.status === NFT_STATUS.BURNED ||
                    item?.status === NFT_STATUS.TRANSFERRED
                      ? '0'
                      : Number(((item?.usdValue / item?.totalValue) * 100).toFixed(2)) > 100
                      ? '100'
                      : ((item?.usdValue / item?.totalValue) * 100).toFixed(2)}
                    %
                  </h6>
                </div>

                {item?.status === NFT_STATUS.GENERATED || item?.status === NFT_STATUS.UPDATED ? (
                  <a href={item?.viewUrl} target="_blank" rel="noreferrer" className="viewAlllink">
                    View
                  </a>
                ) : (
                  ''
                )}
                {item?.status === NFT_STATUS.GENERATED || item?.status === NFT_STATUS.UPDATED ? (
                  item?.usdValue === 0 ? (
                    ''
                  ) : (
                    <button
                      type="button"
                      className="rebalancebtn"
                      onClick={() => {
                        setActiveButton('rebalance')
                        setShowConfModal(true)
                      }}
                    >
                      Rebalance
                    </button>
                  )
                ) : (
                  ''
                )}
              </div>
            </>
          )}
          {isOrderCard && (
            <>
              <div className="nft_data">
                <p>Amount</p>
                <h6>
                  {divideBigNumber(item?.amount?.$numberDecimal, tokenDecimals)} {tokenSymbol}{' '}
                </h6>
              </div>
              <div className="nft_data">
                <p>Ticker</p>
                <h6>{item?.portfolioTicker}</h6>
              </div>
              <div className="nft_data">
                <p>Order Time</p>
                <h6>{moment(item?.time * 1000).format('DD-MM-YYYY hh:mm A')}</h6>
              </div>
              <div className="nft_data">
                <p>Expected Returns</p>
                <h6>{item?.expectedReturns}</h6>
              </div>
              {item?.status === ORDER_STATUS.PENDING && (
                <>
                  <div className="nft_data">
                    <p>Order will execute in</p>
                    <CountdownTimer />
                  </div>
                  <div className="nft_data text-end justify-content-end">
                    <button
                      type="button"
                      className="cancelbtn"
                      onClick={() => {
                        setActiveButton('invest')
                        setShowConfModal(true)
                      }}
                    >
                      Cancel Order
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {isWithdrawRequest && (
            <>
              <div className="nft_data">
                <p>Ticker</p>
                <h6>{item?.portfolioTicker}</h6>
              </div>
              <div className="nft_data">
                <p>Percentage</p>
                <h6>{item?.percentage / 100}%</h6>
              </div>
              <div className="nft_data">
                <p>{item?.status === WITHDRAW_REQUEST_STATUS.CLAIMED ? 'Claimed Amount' : 'Claimable Amount'}</p>
                <h6>
                  {item?.claimAmount
                    ? parseFloat(divideWithDecimal(item?.claimAmount?.$numberDecimal, tokenDecimals))
                    : 0}{' '}
                  {tokenSymbol}
                </h6>
              </div>
              <div className="nft_data">
                {item?.status === WITHDRAW_REQUEST_STATUS.CLAIMED ? (
                  <>
                    <p>Claimed Time</p>
                    <h6>{moment(item?.claimedTime * 1000).format('DD-MM-YYYY hh:mm A')}</h6>
                  </>
                ) : (
                  <>
                    <p>Order Time</p>
                    <h6>{moment(item?.time * 1000).format('DD-MM-YYYY hh:mm A')}</h6>
                  </>
                )}
              </div>
              {item?.status === WITHDRAW_REQUEST_STATUS.PENDING && (
                <>
                  <div className="nft_data">
                    <p>Order will execute in</p>
                    <CountdownTimer />
                  </div>
                  <div className="nft_data text-end justify-content-end">
                    <button
                      type="button"
                      className="cancelbtn"
                      onClick={() => {
                        setActiveButton('withdraw')
                        setShowConfModal(true)
                      }}
                    >
                      Cancel Order
                    </button>
                  </div>
                </>
              )}
              <div className="nft_data text-end mt-3 justify-content-end">
                {item?.transactionHash && !(item?.status === WITHDRAW_REQUEST_STATUS.PENDING) && (
                  <a href={item?.transactionHash} target="_blank" rel="noreferrer" className="viewTransactionlink">
                    View Transaction
                  </a>
                )}
              </div>
              {item?.status === WITHDRAW_REQUEST_STATUS.APPROVED && (
                <div className="nft_data justify-content-end">
                  <ClaimButton item={item} />
                </div>
              )}
            </>
          )}
          {isRebalanceRequests && (
            <>
              <div className="nft_data">
                <p>Ticker</p>
                <h6>{item?.portfolioTicker}</h6>
              </div>
              <div className="nft_data">
                <p>Expected Returns</p>
                <h6>{item?.expectedReturns}</h6>
              </div>
              <div className="nft_data">
                <p>Order Time</p>
                <h6>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</h6>
              </div>
              {item?.status === REBALANCE_REQUEST_STATUS.PENDING && (
                <div className="nft_data">
                  <p>Order will execute in</p>
                  <CountdownTimer />
                </div>
              )}
              <div className="nft_data text-end mt-3 justify-content-end">
                {item?.transactionHash && !(item?.status === WITHDRAW_REQUEST_STATUS.PENDING) && (
                  <a href={item?.transactionHash} target="_blank" rel="noreferrer" className="viewTransactionlink">
                    View Transaction
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmationModal
        text={
          activeButton === 'rebalance'
            ? `You will be charged ${divideWithDecimal(
                rebalnceMyPortfolioFee ?? '0',
                tokenDecimals
              )} ${tokenSymbol} for rebalancing. Are you sure you want to rebalance portfolio?`
            : 'Are you sure you want to cancel order?'
        }
        show={showConfModal}
        handleClose={handleConfModalClose}
        callBack={() => {
          activeButton === 'rebalance'
            ? rebalanceMyPortfolio()
            : activeButton === 'invest'
            ? cancelInvestRequest()
            : cancelWithdrawRequest()
        }}
        itemId={item?.portfolioId}
        buttonLoader={activeButton === 'rebalance' ? 'rebalancePortfolio' : 'cancelrequest'}
      />
    </div>
  )
}

export default NftCard
