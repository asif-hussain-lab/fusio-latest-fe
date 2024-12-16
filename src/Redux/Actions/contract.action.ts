import { useDispatch } from 'react-redux'
import { Dispatch } from 'redux'
import Web3 from 'web3'
import toaster from '../../Components/Common/Toast'
import { getError } from '../../Services/common.service'
import { callGetMethod, callSendMethod, callWeb3, createInstance } from '../../Services/contract.service'
import { buttonLoader, loader } from '../Slices/loader.slice'
import moment from 'moment'

/**CALL COONTRACT'S GET METHODS */
export const callContractGetMethod = (
  method: string,
  data: any = [],
  contractType: string,
  loading = true,
  dynamicAddress = '',
  showError = true,
  provider: any=''
) => {
  return async (dispatch: Dispatch<any> = useDispatch()) => {
    try {
      /**SHOW LOADING */
      if (loading) dispatch(loader(true))
      /**CALL GET METHOD */
      const result = await callGetMethod(method, data, contractType, dynamicAddress, provider)
      if (loading) dispatch(loader(false))
      return result
    } catch (error) {
      if (loading) dispatch(loader(false))
      return showError ? toaster.error(getError(error)) : null
    }
  }
}

/**CALL COONTRACT'S SEND METHODS */
export function callContractSendMethod(
  provider: any,
  method: string,
  data: any = [],
  walletAddress: string,
  contractType: string,
  key: string = '',
  value = '',
  dynamicAddress = ''
) {
  return async (dispatch: Dispatch<any> = useDispatch(), getState: any) => {
    try {
      const wallet = getState().user.walletType
      let verifyAccount: any = false
      /**VALIDATE WALLET */
      if (wallet !== 'MetaMask' || (wallet === 'MetaMask' && verifyAccount)) {
        /**SHOW LOADING */
        dispatch(buttonLoader({ [key]: true }))
        let currentTime = moment.utc()
        let startRange = moment.utc().hours(4).minutes(45)
        let endRange = moment.utc().hours(5).minutes(15)

        if (currentTime.isAfter(startRange) && currentTime.isBefore(endRange)) {
          dispatch(buttonLoader({ [key]: false }))
          toaster.error('Platform is locked from 4:45 am to 5:15 am UTC')
        } else {
          /**CREATE INSTANCE WITH WALLET */
          const contractInstance = await createInstance(provider)
          if (contractInstance) {
            /**CALL SEND METHOD */
            const result = await callSendMethod(
              provider,
              method,
              data,
              walletAddress,
              contractType,
              value,
              dynamicAddress
            )
            dispatch(buttonLoader({ [key]: false }))
            return result
          } else {
            /**IF ANY ERROR IN CREATING INSTANCE */
            dispatch(buttonLoader({ [key]: false }))
            return toaster.error('Some error occurred during contract interaction. Please reload the page.')
          }
        }
      }
    } catch (error) {
      dispatch(buttonLoader({ [key]: false }))
      return toaster.error(getError(error))
    }
  }
}

export const validateAddress = (address: string, type: string) => {
  return async () => {
    try {
      let isAddress = Web3.utils.isAddress(address)
      if (isAddress) {
        let web3: any = await callWeb3()
        let check = await web3.eth.getCode(address)
        if ((check !== '0x' && type === 'wallet') || (check === '0x' && type === 'contract')) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }
}
