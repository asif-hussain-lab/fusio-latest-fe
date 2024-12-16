import { createSlice } from '@reduxjs/toolkit'

/**USER DETAILS SLICE */

const initialState = {
  walletAddress: '',
  walletType: '',
  country:'',
  userBalance: '',
  userDetails: {},
  network: 'Binance',
  refreshUserData: '',
}

export const UserSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    userDetails: (state, param) => {
      const { payload } = param
      state.userDetails = payload
    },
    walletAddress: (state, param) => {
      const { payload } = param
      state.walletAddress = payload
    },
    userBalance: (state, param) => {
      const { payload } = param
      state.userBalance = payload
    },
    walletType: (state, param) => {
      const { payload } = param
      state.walletType = payload
    },
    setCountry: (state, param) => {
      const { payload } = param
      state.country = payload
    },
    refreshUserData: (state, param) => {
      const { payload } = param
      state.refreshUserData = payload
    },
    logoutUser: () => initialState,
  },
})

/**ACTIONS FOR SLICE*/
// eslint-disable-next-line import/no-unused-modules
export const { userDetails, walletAddress, logoutUser, walletType, userBalance, setCountry, refreshUserData } = UserSlice.actions
