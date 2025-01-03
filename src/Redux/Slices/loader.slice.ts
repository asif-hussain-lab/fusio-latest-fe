import { createSlice } from '@reduxjs/toolkit'

/**LOADER SLICE */
const initialState = {
    isLoading: false,
    buttonLoaderDetails: {},
  }

export const LoaderSlice = createSlice({
  name: 'loader',
  initialState,
  
  reducers: {
    loader: (state, param) => {
      const { payload } = param
      state.isLoading = payload
    },
    buttonLoader: (state, param) => {
      const { payload } = param
      state.buttonLoaderDetails = {
        ...state.buttonLoaderDetails,
        ...payload,
      }
    },
    clearLoader: () => initialState,
  },
})

/**ACTION FOR SLICE*/
export const { loader, buttonLoader, clearLoader } = LoaderSlice.actions
