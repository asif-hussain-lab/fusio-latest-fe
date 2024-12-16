import { createSlice } from '@reduxjs/toolkit'

/**USER DETAILS SLICE */
const initialState = {
  isAdmin: false,
  token: '',
}

export const AdminSlice = createSlice({
  name: 'admin',
  initialState,

  reducers: {
    isAdmin: (state, param) => {
      const { payload } = param
      state.isAdmin = payload
    },
    token: (state, param) => {
      const { payload } = param
      state.token = payload
    },
    logoutAdmin: () => initialState,
  },
})

/**ACTIONS FOR SLICE*/
export const { isAdmin, token, logoutAdmin } = AdminSlice.actions
