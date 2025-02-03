import { useWeb3Modal } from '@web3modal/wagmi/react'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { useAccount, useDisconnect, useNetwork, useSignMessage, useSwitchNetwork } from 'wagmi'
import { WalletIcon } from '../../../Assets/svgImgs/svgImgs'
import { logoutAdmin } from '../../../Redux/Slices/admin.slice'
import { clearLoader } from '../../../Redux/Slices/loader.slice'
import { logoutUser, walletAddress } from '../../../Redux/Slices/user.slice'
import { customizeAddress } from '../../../Services/common.service'
import { CHAIN_ID, NETWORK_NAME } from '../../../Utils/constant'
import CommonButton from '../Button/CommonButton'
import toaster from '../Toast'
import './index.scss'

const ConnectWallet = ({ className }: { className?: string }) => {
  /**CREATE DISPATCH OBJECT */
  const { chain } = useNetwork()
  const dispatch: Dispatch<any> = useDispatch()
  const { address, isDisconnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchNetwork } = useSwitchNetwork() as any
  const { signMessageAsync } = useSignMessage()
  const userWalletAddress = useSelector((state: any) => state.user.walletAddress)

  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (address !== undefined) {
        setConnection()
      } else if (isDisconnected || !address) {
        dispatch(logoutUser())
        dispatch(logoutAdmin())
        disconnect()
      }
    }
    fetchData()
  }, [address])

  const setConnection = async () => {
    try {
      if (!userWalletAddress) {
        let result = await signMessageInWallet()
        if (result) {
          dispatch(walletAddress(address))
        } else {
          await disconnect()
        }
      } else if (address !== userWalletAddress && chain?.id === Number(CHAIN_ID)) {
        dispatch(walletAddress(address))
        dispatch(logoutAdmin())
      } else {
        dispatch(walletAddress(address))
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    if (chain && chain?.id !== Number(CHAIN_ID)) {
      toaster.error(`Please connect ${NETWORK_NAME} network`)
      dispatch(clearLoader())
      dispatch(walletAddress(''))
      disconnectHandler()
    }
  }, [chain?.id])

  const signMessageInWallet = async () => {
    try {
      let result = await signMessageAsync({
        message: `Welcome to Fusio Wealth Management!\nClick to sign in.\nThis request will not trigger a blockchain transaction or cost any gas fees.`,
      })
      return result
    } catch (error) {
      console.log('error', error)
      return false
    }
  }

  const disconnectHandler = async () => {
    if (chain && chain?.id !== Number(CHAIN_ID)) {
      toaster.error(`Please connect ${NETWORK_NAME} network`)
      let res = await switchNetwork(Number(CHAIN_ID))
      if (res == undefined) {
      }
    }
    await disconnect()
    dispatch(clearLoader())
  }

  const { open } = useWeb3Modal()
  
  return (
    <div className={`connectWalletbtn ${className}`}>
      <CommonButton
        type="button"
        className="WltBtn"
        title={isToggled ? '*********' : (userWalletAddress ? customizeAddress(userWalletAddress) : 'Connect Wallet')}
        onClick={() => {
          setIsToggled((prev) => !prev);
          open()
        }}
        onlyIcon={<WalletIcon />}
      />
    </div>
  )
}

export default memo(ConnectWallet)
