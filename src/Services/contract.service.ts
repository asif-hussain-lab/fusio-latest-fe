import Web3 from 'web3'
import DynamicABI from '../Abi/Dynamic.ABI.json'
import OrderABI from '../Abi/Order.ABI.json'
import PortfolioABI from '../Abi/Portfolio.ABI.json'
import ProspectorABI from '../Abi/Prospector.ABI.json'

/**ADDRESS FOR INSTANCE */
import { ORDER_EXECUTION_ADDRESS, PORTFOLIO_ADDRESS,  RPC_URL, TOKEN_ADDRESS } from '../Utils/constant'

let web3Instance: any, portfolioInstance: any, orderExecutionInstance: any

export const callWeb3 = (data: any = RPC_URL) => {
  return new Promise(async (resolve) => {
    if (data !== RPC_URL) {
      /**CREATE INSTANCE WITH PROVIDER */
      web3Instance = new Web3(data)
    } else {
      /**CREATE INSTANCE WITH RPC */
      web3Instance = new Web3(RPC_URL)
    }
    resolve(web3Instance)
  })
}

export const createInstance = async (data: any = RPC_URL) => {
  const web3: any = await callWeb3(data)

  /**CREATE CONTRACT INSTANCE WITH ABI */
  portfolioInstance = new web3.eth.Contract(PortfolioABI, PORTFOLIO_ADDRESS)
  orderExecutionInstance = new web3.eth.Contract(OrderABI, ORDER_EXECUTION_ADDRESS)
  return true
}

createInstance()

/**SEND CONTRACT TYPE AND DYAMIC ADDRESS(OPTIONAL) FOR GET CONTRACT INSTANCE*/
const getContractInstance = async (provider: any = RPC_URL, contractType: string, dynamicAddress: string) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    switch (contractType) {
      case 'portfolio':
        return portfolioInstance
          ? resolve(portfolioInstance)
          : createInstance(provider)
              .then(() => {
                resolve(portfolioInstance)
              })
              .catch(reject)
      case 'orderExecution':
        return orderExecutionInstance
          ? resolve(orderExecutionInstance)
          : createInstance(provider)
              .then(() => {
                resolve(orderExecutionInstance)
              })
            .catch(reject)
      case 'prospectorNft':
        // eslint-disable-next-line no-case-declarations
        {
          const web3: any = await callWeb3(provider)
          const prospectorNftInstance =  await new web3.eth.Contract(ProspectorABI, dynamicAddress)
          resolve(prospectorNftInstance)
        }
        break
      case 'dynamic':
        // eslint-disable-next-line no-case-declarations
        {
          const dynamicInstance = web3Instance
            ? await new web3Instance.eth.Contract(DynamicABI, dynamicAddress)
            : await createInstance(provider).then(async () => {
                return await new web3Instance.eth.Contract(DynamicABI, dynamicAddress)
              })
          resolve(dynamicInstance)
        }
        break
      default:
        return null
    }
  })
}

/**CALL CONTRACT GET METHODS. ALL PARAMS WILL BE DYNAMIC */
export const callGetMethod = async (method: string, data: any, contractType: string, dynamicAddress: string, provider?: any) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      /**GET SELECTED CONTRACT INSTANCE */
      const contract: any = await getContractInstance(provider, contractType, dynamicAddress)

      if (contract.methods) {
        /**CALL GET METHOD */
        contract.methods[method]
          .apply(null, Array.prototype.slice.call(data))
          .call()
          .then((result: object) => {
            resolve(result)
          })
          .catch((error: Error) => {
            reject(error)
          })
      } else {
        reject(new Error('Contract not found.'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**CALL CONTRACT SEND METHODS. ALL PARAMS WILL BE DYNAMIC */
export const callSendMethod = async (
  provider: any,
  method: string,
  data: any,
  walletAddress: string,
  contractType: string,
  value: any,
  dynamicAddress: string
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      /**CHECK WALLET IS CONNECTED */
      if (walletAddress === '') {
        reject(new Error('Please connect wallet'))
      }

      /**CREATE DATA FOR CALL SEND METHOD */
      const dataForSend: any = { from: walletAddress }

      /**CHECK IF WE NEED TO SEND VALUE IN SEND METHOD */
      if (value) {
        dataForSend.value = value
      }

      /**GET SELECTED CONTRACT INSTANCE */
      const contract: any = await getContractInstance(provider, contractType, dynamicAddress)
      /**CHECK IF WE NEED TO GIVE APPROVAL TO CONTRACT FOR TOKEN */
      if (method === 'deposit' || method === 'depositOnMPT' || method === 'reBalanceMyPortfolio') {
        const allowanceRes = await giveTokenAllowance({
          provider,
          walletAddress,
          tokenAddress: TOKEN_ADDRESS,
          contract: ORDER_EXECUTION_ADDRESS,
          amount: method === 'depositOnMPT' ? data[0] : data[1],
        })
        if (!allowanceRes) {
          return false
        }
      }
      if (contract.methods) {
        /**ESTIMATE GAS FOR TRANSACTION */
        let gasLimit = await contract.methods[method]
          .apply(null, Array.prototype.slice.call(data))
          .estimateGas(dataForSend)
        let web3: any = await callWeb3(provider)
        dataForSend.gasPrice = await web3.eth.getGasPrice()
        dataForSend.gasLimit = gasLimit

        /**CALL SEND METHOD */
        contract.methods[method]
          .apply(null, Array.prototype.slice.call(data))
          .send(dataForSend)
          .then((result: object) => {
            resolve(result)
          })
          .catch((error: Error) => {
            reject(error)
          })
      } else {
        reject(new Error('Contract not found.'))
      }
    } catch (error) {
      console.log('error', error)
      reject(error)
    }
  })
}

/**FUNCTION FOR GIVE ALLOWANCE TO CONTRACT FOR TOKEN SPEND */
const giveTokenAllowance = async (data: any) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      /**GET SELECTED CONTRACT INSTANCE */
      const allowance: any = await callGetMethod(
        'allowance',
        [data.walletAddress, data.contract],
        'dynamic',
        data.tokenAddress
      )
      /**CHECK ALLOWANCE IS ALREADY GIVEN OR NOT */
      if (parseInt(allowance) < data?.amount) {
        /**SET ALLOWANCE VALUE AS 10**40 */
        const maxlimit: any = data?.amount

        /**CALL SEND METHOD */
        const allowanceRes: any = await callSendMethod(
          data?.provider,
          'approve',
          [data.contract, maxlimit],
          data.walletAddress,
          'dynamic',
          null,
          data.tokenAddress
        )
        if (!allowanceRes.status) {
          return false
        }
      }
      resolve(allowance)
    } catch (error) {
      reject(error)
    }
  })
}
