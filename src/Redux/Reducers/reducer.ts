import { combineReducers } from 'redux'
import { AdminSlice } from '../Slices/admin.slice'
import { LoaderSlice } from '../Slices/loader.slice'
import { TokenSlice } from '../Slices/token.slice'
import { UserSlice } from '../Slices/user.slice'

/**COMBINE ALL REDUCERS */

export const reducers = combineReducers({
  user: UserSlice.reducer,
  admin: AdminSlice.reducer,
  loader: LoaderSlice.reducer,
  token: TokenSlice.reducer,
})
