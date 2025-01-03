import { createSlice } from '@reduxjs/toolkit'

/**ICO SLICE */
export const TokenSlice = createSlice({
  name: 'token',
  initialState: {
    bnbDecimals: '',
    tokenDecimals: '',
    tokenSymbol: '',
  },

  reducers: {
    bnbDecimals: (state, param) => {
      const { payload } = param
      state.bnbDecimals = payload
    },

    tokenDecimals: (state, param) => {
      const { payload } = param
      state.tokenDecimals = payload
    },

    tokenSymbol: (state, param) => {
      const { payload } = param
      state.tokenSymbol = payload
    },
  },
})

// ACTIONS FOR SLICE
export const { bnbDecimals, tokenDecimals, tokenSymbol } = TokenSlice.actions
