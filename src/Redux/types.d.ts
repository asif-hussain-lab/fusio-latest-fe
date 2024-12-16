type Action = {
  type: string
  payload: any
}
type DispatchType = (args: Action) => Action

type UserState = {
  walletAddress: string | null
  userBalance: string | null
  wallet: string | null
  network: string | null
  isAdmin: boolean | false
  userInfo: string | null
  adminType: string | null
  currencyType: string | null
  adminInfo: string | null
}

type LoadingState = {
  isLoading: boolean | false
}
