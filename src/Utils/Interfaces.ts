import { ReactNode } from 'react'

export interface AssetBoxCardProps {
    className?: string
    title?: string
    link?: string
    text?: string | ReactNode
    onClick?: () => void
    amount?: string
    title1?: string
    text1?: any
    linktext?: string
    to?: any
}

export interface AdminHeaderProps {
    afterLogin?: boolean
    active?: boolean
    handleSidebar?: () => void
}

export interface CommonButtonProps {
    className?: string
    type?: "submit" | "reset" | "button" | undefined
    transparent?: boolean
    fluid?: boolean
    onClick?: () => void
    buttonLoader?: any
    title?: string
    btnIcon?: string
    onlyIcon?: any
    disabled?: boolean
}

export interface CommonLinkProps {
    className?: string
    onClick?: () => void
    icon?: ReactNode
    text?: string
    to?: any
}

export interface ModalProps {
    show: boolean
    handleClose: () => void
}

export interface CommonModalsProps extends ModalProps {
    heading?: ReactNode
    className?: string
    variant?: 'small' | 'large'
    children?: ReactNode
    backdropClassName?: string
    backdrop?: any
    msg?: string
}

export interface ConfirmationModalProps extends ModalProps {
    text?: string
    callBack?: any
    itemId?: number
    buttonLoader?: string
}

export interface PortfoliosNameModalProps extends ModalProps {
    investedPortfolios: any
}

export interface RebalancingPortfolioModalProps extends ModalProps {
    requestId: number
}

export interface WithdrawModalProps extends ModalProps {
    portfolio: any
    renderClass: (portfolio: any) => string
}

export interface CommonSearchProps {
    className?: string
    label?: string
    name?: string
    placeholder?: string
    maxLength?: number
    onChange?: (arg: any) => void
    value?: string
}

export interface CommonTableProps {
    className?: string
    fields?: Array<string>
    sortbuttons?: boolean
    children?: any
    noRecordFound?: boolean
    loading?: boolean
}

export interface CustomTooltipProps {
    placement?: any
    text?: string
    icon?: any
    className?: string
    toolclass?: string
}

export interface SwitchProps {
    id?: string
    label?: string | ReactNode
    name?: string
    disabled?: boolean
    onChange?: any
    value?: string
    className?: string
    checked?: boolean
}

export interface InvestedCardProps {
    className?: string;
    icon?: ReactNode;
    value?: string | number;
    name?: string;
    text?: string;
    returnsNo?: any;
    amount?: any;
}

export interface CustomDropdownProps {
    options?: any;
    icon?: ReactNode;
    value?: string | number;
    onSelect?: any;
    defaultOption?: any
    placeholder?: string;
    className?: string;
}

export interface LegacyPortfolioCardProps {
    icon?: ReactNode;
    title?: string;
    no?: number;
}
interface Asset {
    symbol: string;
    allocation?: number;
}

export interface ManageCardProps {
    addClass?: string;
    portfolioId?: string;
    heading?: string;
    ticker?: string;
    asset?: Asset[];
    cate?: boolean;
    returns?: string | number;
    minInvestment?: string | number;
    expenseRatio?: string | number;
    fees?: number;
    admin?: boolean;
    portfolioType?: number;
    options?: any[];
    isList?: any;
    defaultOption?: any;
    deleteicon?: boolean;
    isEnabled?: boolean;
    editicon?: boolean;
    onClick?: (arg?: string) => void;
    getPortfolioList?:any
    loading?: boolean;
    Listdropdown?:boolean
}

export interface NftCardProps {
    item: any;
    className?: string;
    rebalnceMyPortfolioFee?: string;
    isNftCard?: boolean;
    isOrderCard?: boolean;
    isWithdrawRequest?: boolean;
    isRebalanceRequests?: boolean;
}

export interface PaginationProps {
    pageNeighbours?: number
    totalRecords: number,
    pageLimit: number,
    onPageChanged: any,
    currentPage: number,
    totalPage: number
    className?: string
}

export interface valueType { value: string | number; label: string | ReactNode }
export interface CustomSelectProps {
    defaultValue?: valueType
    onChange?: any
    options?: valueType[]
    menuIsOpen?: boolean
    className?: string
    name?: string
    isMulti?: boolean
    value?: valueType
    isClearable?: any
    onMenuScrollToBottom?: any
    placeholder?: any
    filterOption?: any
    isSearchable?: boolean
    closeMenuOnSelect?: boolean
    error?: any
}

export interface SelectDropdownProps extends CustomSelectProps {
    loader?: any
    portfolioList?: any
    callback?: any
    data?: valueType
}

export interface WalletAddressProps {
    usersList: any
    callback: any
    selectedUser: string | undefined
    loading: boolean
} 

export interface AllInvestmentProps {
    AllInvestedCard:any
    callBack:any
    setActiveKeyInner:any
    selectedPf:any 
}

export interface CoinListProps {
    priceType: string
    assets: any
    loading?:boolean
}

export interface InvestmentAmountCardProps {
    pendingWithdrawRequest: any
    pendingRebalanceRequest: boolean
    pendingInvestRequest:boolean
    portfolio: any
    disabled: boolean
    aumFees: number
    callBack?: any
}