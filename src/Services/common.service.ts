import BigValue from 'bignumber.js'
import JSBI from 'jsbi'
import store from '../Redux/Store'
import { NFT_STATUS, ORDER_STATUS, PRICE_STATE, REBALANCE_REQUEST_STATUS, REINVEST_REQUEST_STATUS, TRANSACTION_STATUS, WITHDRAW_REQUEST_STATUS } from '../Utils/Utils'
import { LENGTH, SECRET_KEY1, SECRET_KEY2, SECRET_KEY3, SECRET_KEY4 } from '../Utils/constant'
import { clearLoader } from '../Redux/Slices/loader.slice'
import { logoutAdmin } from '../Redux/Slices/admin.slice'
import { logoutUser } from '../Redux/Slices/user.slice'
import packageJson from '../../package.json'
import axios from 'axios'
var CryptoJS = require('crypto-js')

/**CUTMIZE ADDRESS FOR SHOW */
export const customizeAddress = (address: string) => {
  const firstFive = address.substring(0, 5)
  const lastFour = address.substring(address.length - 4)
  return firstFive + '...' + lastFour
}
export const multiplyTwoBigDigits = (valueOne: any, valueTwo: any) => {
  const a = JSBI.BigInt(valueOne)
  const b = JSBI.BigInt(valueTwo)
  const result = JSBI.multiply(a, b)
  return String(result)
}

export const multiplyBigDigitsWithDecimals = (valueOne: string, valueTwo: string) => {
  let a: any
  let b: any
  let decimalLengthA: any = 0
  let decimalLengthB: any = 0

  if (valueOne.includes('.')) {
    a =
      valueOne.split('.')[1].length > 0
        ? convertWithDecimal(valueOne, valueOne.split('.')[1].length)
        : valueOne.split('.')[0]
    decimalLengthA = valueOne.split('.')[1].length
  } else {
    a = valueOne
  }
  if (valueTwo.includes('.')) {
    b = convertWithDecimal(valueTwo, valueTwo.split('.')[1].length)
    decimalLengthB = valueTwo.split('.')[1].length
  } else {
    b = valueTwo
  }
  const decimalLength = decimalLengthA + decimalLengthB
  let result = multiplyTwoBigDigits(a, b)
  if (
    result.substring(0, result.length - decimalLength).length &&
    result.substring(result.length - decimalLength).length
  ) {
    result = result.substring(0, result.length - decimalLength) + '.' + result.substring(result.length - decimalLength)
  } else if (!result.substring(0, result.length - decimalLength).length) {
    // eslint-disable-next-line
    result = '0' + '.' + result.substring(result.length - decimalLength)
  }
  return result
}

function numberToString(arg: any) {
  if (typeof arg === 'string') {
    if (!arg.match(/^-?[0-9.]+$/)) {
      throw new Error(
        "while converting number to string, invalid number value '" +
        arg +
        "', should be a number matching (^-?[0-9.]+)."
      )
    }
    return arg
  } else if (typeof arg === 'number') {
    return String(arg)
  } else if (typeof arg === 'object' && arg.toString && (arg.toTwos || arg.dividedToIntegerBy)) {
    if (arg.toPrecision) {
      return String(arg.toPrecision())
    } else {
      // eslint-disable-line
      return arg.toString(10)
    }
  }
  throw new Error("while converting number to string, invalid number value '" + arg + "' type " + typeof arg + '.')
}

// Function to convert into wei
function toWei(input: any, unit: any) {
  var ether = numberToString(input) // eslint-disable-line
  const base = unit
  const baseLength = base.length - 1 || 1
  if (ether === '.') {
    throw new Error('[ethjs-unit] while converting number ' + input + ' to wei, invalid value')
  }

  // Is it negative?
  const negative = ether.substring(0, 1) === '-'

  if (negative) {
    ether = ether.substring(1)
  }
  // Split it into a whole and fractional part
  var comps = ether.split('.') // eslint-disable-line
  if (comps.length > 2) {
    throw new Error('[ethjs-unit] while converting number ' + input + ' to wei,  too many decimal points')
  }
  let whole = comps[0],
    fraction = comps[1] // eslint-disable-line
  if (!whole) {
    whole = '0'
  }
  if (!fraction) {
    fraction = '0'
  }
  if (fraction.length > baseLength) {
    throw new Error('[ethjs-unit] while converting number ' + input + ' to wei, too many decimal places')
  }

  while (fraction.length < baseLength) {
    fraction += '0'
  }

  if (!parseInt(whole)) {
    return fraction.replace(/^0*(?=[1-9])/g, '')
  }

  if (negative) {
    return '-' + whole + fraction
  }

  return whole + fraction
}

function fromWei(value, numberOfDecimals) {
  const numberOfZerosInDenomination = numberOfDecimals.length - 1
  if (numberOfZerosInDenomination <= 0) return value
  const zeroPaddedValue = value?.padStart(numberOfZerosInDenomination, '0')
  const integer = zeroPaddedValue?.slice(0, -numberOfZerosInDenomination)
  const fraction = zeroPaddedValue?.slice(-numberOfZerosInDenomination).replace(/\.?0+$/, '')
  if (integer === '') return `0.${fraction}`
  if (fraction === '') return integer
  return `${integer}.${fraction}`
}

export const intToSuffixes = (num: any, fixed = 2) => {
  num = parseFloat(num)
  if (num === null) {
    return null
  } // terminate early
  if (num === 0) {
    return '0'
  } // terminate early
  fixed = !fixed || fixed < 0 ? 0 : fixed // number of decimal places to show
  const b: any = num.toPrecision(2).split('e'), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ['', 'K', 'M', 'B', 'T'][k] // append power
  return e
}

// eslint-disable-next-line import/no-unused-modules
export const divideBigNumber = (value: any, decimal: number, suffixes = false) => {
  if (!decimal || decimal === 0 || !value) {
    return '0'
  } else {
    const decimalBigN = JSBI.BigInt(decimal)
    const convertedDecimal = JSBI.exponentiate(JSBI.BigInt(10), decimalBigN)
    const x = new BigValue(value?.toString())
    const y = new BigValue(String(convertedDecimal))
    const z = x.dividedBy(y)
    return suffixes ? intToSuffixes(parseFloat(z.toString())) : fixedToDecimal(z.toString(), 5)
  }
}

/** Divide with Decimal*/
export const divideWithDecimal = (value: any, decimal: any) => {
  const decimalBigN = JSBI.BigInt(decimal)
  const convertedDecimal = JSBI.exponentiate(JSBI.BigInt(10), decimalBigN)
  let result = fromWei(value, String(convertedDecimal))
  // result = parseFloat(result).toLocaleString('en-US')
  return fixedToDecimal(result)
}

/**CONVERT NUMBER WITH DECIMALS FOR CONTRACT CALL */
export const convertWithDecimal = (value: any, decimal: any) => {
  const decimalBigN = JSBI.BigInt(decimal)
  const convertedDecimal = JSBI.exponentiate(JSBI.BigInt(10), decimalBigN)
  return toWei(value, String(convertedDecimal))
}

/**REMOVE e FORM BIG NUMBER */
// eslint-disable-next-line import/no-unused-modules
export const toFixed = (x: any) => {
  let e: any
  if (Math.abs(x) < 1.0) {
    // eslint-disable-next-line no-var
    e = parseInt(x.toString().split('e-')[1])
    if (e) {
      x *= Math.pow(10, e - 1)
      x = '0.' + new Array(e).join('0') + x.toString().substring(2)
    }
  } else {
    e = parseInt(x.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      x /= Math.pow(10, e)
      x += new Array(e + 1).join('0')
    }
  }
  return x
}

/**GET ERROR MESSAGE FORM ERROR OBJECT */
export const getError = (error: any) => {
  const errorMsg = error.message ? error.message : 'Something went wrong'
  if (errorMsg.indexOf('execution reverted') > -1) {
    let msg = errorMsg
    msg = msg =
      msg.indexOf('execution reverted:') > -1 ? msg.split('execution reverted:')[1].split('{')[0].split('"')[0] : msg
    return msg
  } else if (errorMsg.indexOf('INVALID_ARGUMENT') > -1) {
    return errorMsg.split('(')[0]
  } else if (errorMsg.indexOf('MetaMask Tx Signature') > -1) {
    const msg = errorMsg.replace('MetaMask Tx Signature:', '')
    return msg
  } else {
    const err = errorMsg.split('*')[0].split(':')[1]
    if (err?.trim() === 'insufficient funds for gas') {
      return err
    } else {
      return errorMsg
    }
  }
}

/**CREATE URL FOR API CALL WITH PARAMS */
export const formatUrl = (url, params) => {
  params = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : ``
  return `${url}${params}`
}

/**ALLOW ONLY STRING */
export const allowOnlyString = (inputString) => {
  const res = /^[a-zA-Z]+$/.test(inputString)
  return res
}

/**SHOW VALUE WITH ONLY SELECTED DECIMALS */
// eslint-disable-next-line import/no-unused-modules
export const fixedToDecimal = (value: any, decimals = 2) => {
  decimals = 2;
  value =
    value && parseFloat(value) !== 0
      ? decimals === 2
        ? value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
        : value.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]
      : 0
  return value
}

export const allowOnlyNumberWithDecimalsInput = (value: any, decimals: any) => {
  let re
  let decimalValue = Number(decimals)

  re = new RegExp('^(\\d{0,10}|\\d{0,12}\\.\\d{0,' + decimalValue + '})$', 'gm')
  if (re?.test(value)) {
    return true
  } else {
    return false
  }
}

export const getTrends = async (currentPrice: any, previousPrice: any) => {
  const tokenDecimals = store?.getState().token?.tokenDecimals
  const prevPrice = divideWithDecimal(previousPrice, tokenDecimals)
  const returns = currentPrice - prevPrice
  const percentageChange = ((currentPrice - prevPrice) / prevPrice) * 100
  let priceStatus
  if (currentPrice > prevPrice) {
    priceStatus = PRICE_STATE.UP
  } else if (currentPrice < prevPrice) {
    priceStatus = PRICE_STATE.DOWN
  } else {
    priceStatus = PRICE_STATE.UNCHANGED
  }
  return [priceStatus, returns, `${percentageChange.toFixed(2)}%`]
}

function isPrime(number: number) {
  if (number <= 1) {
    return false
  }

  if (number <= 3) {
    return true
  }

  if (number % 2 === 0 || number % 3 === 0) {
    return false
  }

  for (let i = 5; i * i <= number; i += 6) {
    if (number % i === 0 || number % (i + 2) === 0) {
      return false
    }
  }

  return true
}

function getPrimeNumbersInRange(start: number, end: number) {
  const primeNumbers: any = []

  for (let number = start; number <= end; number++) {
    if (isPrime(number)) {
      primeNumbers.push(number)
    }
  }
  return primeNumbers
}

function getKey(value: number) {
  let encyptionKey = SECRET_KEY1.concat(SECRET_KEY2, SECRET_KEY3, SECRET_KEY4)
  const primeNumbers: any = getPrimeNumbersInRange(1, value)
  const string = primeNumbers.map((number: number) => encyptionKey[number]).join('')
  return string
}

export const decrypt = (data: any, string = false) => {
  try {
    const key: string = getKey(Number(LENGTH))
    const decryptData = CryptoJS.AES.decrypt(data, key)
    let stringData = decryptData.toString(CryptoJS.enc.Utf8)
    stringData = string ? stringData : JSON.parse(stringData)
    return stringData
  } catch (error) {
    console.error('Error fetching data:', error)
    return false
  }
}
export const encryptData = (data: any, string = false) => {
  const key: string = getKey(Number(LENGTH))
  const stringData = JSON.stringify(data)
  const encryptData = CryptoJS.AES.encrypt(stringData, key).toString()
  return encryptData
}

export const addBigNumber = (num1: any, num2: any) => {
  num1 = Math.trunc(num1)
  num2 = Math.trunc(num2)
  num1 = JSBI.BigInt(num1)
  num2 = JSBI.BigInt(num2)
  return JSBI.add(num1, num2).toString()
}

export const handleBigNumbers = (number1: any, number2: any, action: string = 'sum') => {
  try {
    const bigInt1 = BigInt(number1.toString().includes('.') ? number1.split('.')[0] : number1)
    const bigInt2 = BigInt(number2.toString().includes('.') ? number2.split('.')[0] : number2)
    let result
    switch (action) {
      case 'sum':
        result = bigInt1 + bigInt2
        break
      case 'sub':
        result = bigInt1 - bigInt2
        break
      case 'mul':
        result = bigInt1 * bigInt2
        break
      case 'div':
        result = bigInt1 / bigInt2
        break
      default:
        result = 0
    }
    result = result.toString().includes('.') ? result.toString().split('.')[0] : result

    return result.toString().replace(/n$/, '')
  } catch (error) {
    return error
  }
}

export function renderOrderStatusClassName(status: string) {
  try {
    switch (status) {
      case ORDER_STATUS.EXECUTED:
        return 'green_bg'
      case ORDER_STATUS.PENDING:
        return 'yellow_bg'
      case ORDER_STATUS.INPROGRESS:
        return 'blue_bg'
      case ORDER_STATUS.FAILED:
      case ORDER_STATUS.CANCELLED:
        return 'red_bg'
      default:
        return ''
    }
  } catch (error) {
    console.error('Error occurred in renderOrderStatusClassName:', error)
    return ''
  }
}

export function renderRequestStatusClassName(status: string) {
  try {
    switch (status) {
      case WITHDRAW_REQUEST_STATUS.APPROVED:
      case WITHDRAW_REQUEST_STATUS.CLAIMED:
        return 'green_bg'
      case WITHDRAW_REQUEST_STATUS.PENDING:
        return 'yellow_bg'
      case WITHDRAW_REQUEST_STATUS.INPROGRESS:
        return 'blue_bg'
      case WITHDRAW_REQUEST_STATUS.FAILED:
      case WITHDRAW_REQUEST_STATUS.CANCELLED:
        return 'red_bg'
      default:
        return ''
    }
  } catch (error) {
    console.error('Error occurred in renderRequestStatusClassName:', error)
    return ''
  }
}

export function renderRebalnceStatusClassName(status: string) {
  try {
    switch (status) {
      case REBALANCE_REQUEST_STATUS.APPROVED:
      case REBALANCE_REQUEST_STATUS.EXECUTED:
        return 'green_bg'
      case REBALANCE_REQUEST_STATUS.PENDING:
        return 'yellow_bg'
      case REBALANCE_REQUEST_STATUS.INPROGRESS:
        return 'blue_bg'
      case REBALANCE_REQUEST_STATUS.FAILED:
      case REBALANCE_REQUEST_STATUS.CANCELLED:
        return 'red_bg'
    }
  } catch (error) {
    console.error('Error occurred in renderRebalnceStatusClassName:', error)
    return ''
  }
}

export function renderTransactionStatusClassName(status: string) {
  try {
    switch (status) {
      case TRANSACTION_STATUS.INVESTED:
        return 'green_text'
      case TRANSACTION_STATUS.WITHDRAW:
        return 'yellow_text'
      case TRANSACTION_STATUS.CLAIMED:
        return 'red_text'
      case TRANSACTION_STATUS.REINVEST:
      case TRANSACTION_STATUS.REBALANCING:
        return 'blue_text'
      default:
        return ''
    }
  } catch (error) {
    console.error('Error occurred in renderTransationStatusClassName:', error)
    return ''
  }
}


export function renderReallocationStatusClassName(status: string) {
  try {
    switch (status) {
      case REINVEST_REQUEST_STATUS.REJECTED:
      case REINVEST_REQUEST_STATUS.CANCELLED:
        return 'red_text'
      case REINVEST_REQUEST_STATUS.PENDING:
        return 'yellow_text'
      case REINVEST_REQUEST_STATUS.APPROVED:
      case REINVEST_REQUEST_STATUS.EXECUTED:
        return 'green_text'
    }
  } catch (error) {
    console.error('Error occurred in renderReallocationStatusClassName:', error)
    return ''
  }
}

export function renderNftStatusClassName(status: string) {
  try {
    switch (status) {
      case NFT_STATUS.BURNED:
        return 'red_text'
      case NFT_STATUS.GENERATED:
        return 'yellow_text'
      case NFT_STATUS.UPDATED:
        return 'green_text'
      case NFT_STATUS.TRANSFERRED:
        return 'blue_text'
    }
  } catch (error) {
    console.error('Error occurred in renderReallocationStatusClassName:', error)
    return ''
  }
}

export const resetRedux = () => {
  store.dispatch(logoutAdmin())
  store.dispatch(clearLoader())
  store.dispatch(logoutUser())
}

// Resets cache
export const versionManager = async () => {
  try {
    const version = packageJson.version
    const react_version = localStorage.getItem('react_version')

    if (!react_version || (react_version && version !== react_version)) {
      resetRedux()
      localStorage.clear()
      window.location.reload()
    }

    localStorage.setItem('react_version', version)
  } catch (error) { }
}

export const getOrigin =  async() => {
  return new Promise((resolve, reject) => {
    axios.get(`https://ipinfo.io/json?token=6db9d1db43a3e2`)
      .then((response) => {
        resolve(JSON.parse(response.request.response));
      })
      .catch(error => {
        // Handle error 
        console.error(error);
        reject(error)
      });
  })
}

