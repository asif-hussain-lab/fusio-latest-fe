export const APIURL: Object = {
  ADMIN_LOGIN: `login`,
  EXECUTE_ORDERS: `admin/executeOrders`,
  GET_TOKEN_INFO: 'token/getTokenInfo',
  GET_WHITELISTED_TOKENS: 'token/getWhitelistedTokens',
  GET_ALL_WHITELISTED_TOKENS: 'token/getAllWhitelistedTokens',
  GET_PORTFOLIO_LIST: 'portfolio/getPortfolioList',
  GET_PORTFOLIO_DETAILS: 'portfolio/getPortfolioDetails',
  GET_PORTFOLIO_NAMES: 'portfolio/getPortfolioNames',
  GET_USER_TRANSACTIONS: 'transactions/getTransactions',
  GET_ORDER_DETAILS: 'orders/getOrders',
  GET_NFT_DETAILS: 'nft/getNft',
  GET_ADMIN_NFT_DETAILS: 'admin/getNft',
  GET_DASHBOARD_DATA: 'admin/getDashboardData',
  GET_USERS_LIST: 'admin/getUsersList',
  GET_USER_INVESTMENT: 'admin/getUserInvestments',
  GET_INVESTMENT_TRENDS: 'admin/getInvestmentTrends',
  GET_PORTFOLIO_INVESTMENT: 'portfolio/getPortfolioInvestments',
  GET_AUM_FEES_DATA_FOR_EACH_PORTFOLIO: 'admin/getAumFeesDetails',
  GET_ALL_INVESTMENTS_FOR_USER: 'investment/getAllInvestments',
  GET_TOKEN_STATUS: 'token/getWhitelisted',
  EXPORT_TRANSACTIONS_DATA: 'admin/exportTransactions',
  EXPORT_ALL_USERS_AND_INVESTMENTS: 'admin/exportAllUsersAndinvestments',
  GET_PORTFOLIO_INVESTORS_LIST: '/admin/getPortfolioInvestorsList',
  GET_WITHDRAW_REQUESTS: 'orders/getWithdrawsRequests',
  GET_PENDING_WITHDRAW_REQUESTS: 'orders/getPendingWithdrawalRequest',
  GET_USER_PORTFOLIO_VALUE: 'investment/getUserPortfolioValue',
  GET_ADMIN_ORDERS: 'admin/getOrders',
  GET_ADMIN_WITHDRAW_REQUESTS: 'admin/getWithdrawsRequests',
  GET_ADMIN_INCOME_ANALYTICS: 'admin/getAdminIncomeAnalytics',
  GET_TRANSACTION_SIGNATURE: 'transactions/getTransactionSignature',
  GET_CF_SIGNATURE: 'portfolio/getCFSignature',
  GET_DAO_NFT_DISCOUNT: 'transactions/getUserDiscount',
  GET_PENDING_REBALANCE_REQUESTS: 'portfolio/getPendingReallocationRequest',
  SUBMIT_REBALANCE_REQUESTS: 'portfolio/saveAssetsRellocationRequest',
  CANCEL_REINVESTMENT_REQUEST: 'portfolio/cancelReallocationRequest',
  GET_REALLOCATION_REQUESTS: 'admin/getReallocationRequests',
  GET_REQUEST_INFO: 'admin/getRequestInfo',
  REJECT_REINVEST_REQUEST: 'admin/rejectReInvestmentRequest',
  GET_UPDATE_ASSET_SIGNATURE: 'admin/getUpdateAssetsSignature',
  GET_UPDATE_DETAILS_SIGNATURE: 'portfolio/getUpdatePortfolioInfoSignature',
  GET_CANCEL_INVEST_SIGNATURE: 'portfolio/getCancelInvestSignature',
  GET_BURN_USER_NFT: 'orders/getBurnUserNft',
  GET_NOTIFICATION_COUNT: 'notifications/getNewNotificationsCount',
  GET_NOTIFICATION_LIST: 'notifications/getNotifications',
  READ_NOTIFICATION: 'notifications/readUserNotifications',
  GET_INVESTMENT_ALLOCATIONS: 'investment/getInvestmentAllocations',
  GET_REALLOCATION_INFO: 'portfolio/getAssetsReallocationInfo',
  GET_USER_REBALANCE_REQUESTS: 'orders/getRebalanceRequests',
  GET_REBALANCE_REQUESTS: 'admin/getRebalanceRequests',
  GET_USERINVESTMENT_INFO: 'portfolio/getUserInvestmentInfo',
  GET_WHITELISTED_NFTS: 'admin/getNftForCF',
  GET_NETWORK_LIST: 'admin/getCFNftNetworks',
}

export const CARDLIMIT = 6
export const TABLELIMIT = 10
export const PFNAMELIMIT = 6
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDRESS_ARRAY = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS]
export const DAO_DISCOUNT = 40

export enum RESPONSES {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UN_AUTHORIZED = 401,
  INVALID_REQ = 422,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TIMEOUT = 408,
  TOO_MANY_REQ = 429,
  INTERNAL_SERVER = 500,
  BAD_GATEWAYS = 502,
  SERVICE_UNAVILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export enum PORTFOLIO_TYPE {
  legacy = 1,
  cf = 2,
  byop = 3,
  mpa = 4,
}

export enum ORDER_STATUS {
  PENDING = 'Pending',
  EXECUTED = 'Executed',
  INPROGRESS = 'InProgress',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
}

export enum NFT_STATUS {
  GENERATED = 'Generated',
  UPDATED = 'Updated',
  BURNED = 'Burned',
  TRANSFERRED = 'Transferred',
}

export enum TRANSACTION_STATUS {
  INVESTED = 'Invest',
  WITHDRAW = 'Withdraw',
  CLAIMED = 'Claimed',
  REINVEST = 'Reinvest',
  REBALANCING = 'Rebalance',
}

export enum PRICE_STATE {
  UP = 1,
  DOWN = -1,
  UNCHANGED = 0,
}

export enum CF_AUM_FEE_RANGE {
  MIN = 2.5,
  MAX = 5,
}

export enum BYOP_AUM_FEE_RANGE {
  MIN = 2.5,
  MAX = 5,
}

export enum WITHDRAW_REQUEST_STATUS {
  PENDING = 'Pending',
  INPROGRESS = 'InProgress',
  APPROVED = 'Approved',
  CLAIMED = 'Claimed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
}

export enum REBALANCE_REQUEST_STATUS {
  PENDING = 'Pending',
  INPROGRESS = 'InProgress',
  APPROVED = 'Approved',
  EXECUTED = 'Executed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
}

export enum REINVEST_REQUEST_STATUS {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  EXECUTED = 'Executed',
}

export const EXPECTED_RETURNS = [
  { value: 'Conservative', label: 'Conservative' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Growth', label: 'Growth' },
  { value: 'Aggressive Growth', label: 'Aggressive Growth' },
]

export const RETURNS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Conservative', label: 'Conservative' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Growth', label: 'Growth' },
  { value: 'Aggressive Growth', label: 'Aggressive Growth' },
]

export const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: PORTFOLIO_TYPE.legacy, label: 'Legacy Funds' },
  { value: PORTFOLIO_TYPE.cf, label: 'Curated Funds' },
  { value: PORTFOLIO_TYPE.byop, label: 'Portfolio Builder' },
]

export const PRICE_TYPE = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export enum ROUTES {
  DASHBOARD = 'dashboard',
  PORTFOLIO = 'portfolio',
  MANAGE_PORTFOLIO = 'portfolio/manage-portfolio',
  INVESTOR = 'investor',
  INCOME_ANALYSIS = 'income-analysis',
  NFT_MANAGEMENT = 'nft-management',
  ORDERS = 'orders',
  WHITELIST_TOKEN = 'whitelist-token',
  WHITELIST_NFT = 'whitelist-nft',
  REALLOCATION = 'reallocation',
  SETTINGS = 'settings',
}

export const eyeIconImage = 'https://tokens-data.1inch.io/images/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'

export const COUNTRY_TO_RESTRICT = 'US'
