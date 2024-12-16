import axios from 'axios'
import toaster from '../Components/Common/Toast'
import { logoutAdmin } from '../Redux/Slices/admin.slice'
import store from '../Redux/Store'
import { RESPONSES } from '../Utils/Utils'
import { API_HOST } from '../Utils/constant'
import { decrypt, encryptData, formatUrl } from './common.service'

export const storeInstance = store
axios.defaults.baseURL = API_HOST

let failedQueue: any = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**AXIOS INTERCEPTOR */
axios.interceptors.request.use(
  async (config) => {
    const token = storeInstance.getState().admin.token
    config.headers['Authorization'] = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'
    config.headers['Access-Control-Allow-Origin'] = '*'
    return config
  },
  (error) => {
    return error
  }
)

/**HANDLE AXIOS RESPONSE */
axios.interceptors.response.use(
  async (response) => {
    response.data = await decrypt(response?.data)
    return response
  },
  (error) => {
    if (!error.response) {
      toaster.error('Server not responding. Please try again later.')
    } else {
      return manageErrorConnection(error)
    }

    const originalRequest = error.config
    failedQueue.push(originalRequest)
    if (error?.response?.status === 403) {
      processQueue(error, null)
    }
  }
)
/**HANDLE AXIOS ERROR */
export function manageErrorConnection(err) {
  if (err?.response && err?.response?.status >= 400 && err.response?.status <= 500) {
    toaster.error(err?.response?.data?.message)
    if (err?.response?.status === 401) {
      setTimeout(function () {
        store.dispatch(logoutAdmin())
      }, 1000)
    }
  } else if (err.code === 'ECONNREFUSED') {
    toaster.error('ECONNREFUSED')
    return 'nevermind'
  } else {
    toaster.error(err)
  }
}

/**HANDLE AXIOS SUCCESS */
function handleSuccess(res) {
  if (res?.status === RESPONSES.SUCCESS || res?.status === RESPONSES.CREATED)
    res?.data?.message && toaster.success(res.data.message)
  else {
    res?.data?.message && toaster.info(res.data.message)
  }
}

/**METHOD FOR CALL API */
export const apiCallPost = (url, data, params = {}, showtoaster = false) =>
  new Promise((resolve, reject) => {
    let encParams = params ? { query: encryptData(JSON.stringify(params)) } : { query: '' }
    axios
      .post(formatUrl(url, encParams), { data: encryptData(data) })
      .then((res) => {
        showtoaster && handleSuccess(res)
        resolve(res?.data)
      })
      .catch((err) => { 
        reject(err)
      })
  })

/**METHOD FOR SEND API */
export const apiCallGet = (url, params: any = {}, showtoaster = false) =>
  new Promise((resolve, reject) => {
    let encParams = params ? { query: encryptData(JSON.stringify(params)) } : { query: '' }
    axios
      .get(formatUrl(url, encParams))
      .then((res) => {
        showtoaster && handleSuccess(res)
        resolve(res?.data)
      }) 
      .catch((err) => {
        reject(err)
      })
  })

export const openNewTab = (url, params) =>
  new Promise((resolve) => {
    const token = storeInstance.getState().admin.token
    params.authorization = `Bearer ${token}`
    window.open(`${formatUrl(API_HOST + url, params)}`, '_blank')
  })
