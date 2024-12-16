import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../../../Services/common.service'
import PercentageChange from '../../../../Common/PercentageChange/PercentageChange'
import AssetsInfo from '../AssetsInfo/AssetsInfo'
import './InformationPanelCard.scss'

const InformationPanelCard = ({ portfolioId }: { portfolioId: number }) => {
  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const [loading, setLoading] = useState<any>(false)
  const [portfolioDetails, setPortfolioDetails] = useState<any>()

  const getPortfolioDetails = async () => {
    setLoading(true)
    setPortfolioDetails('')
    let result: any = await dispatch(callApiGetMethod('GET_PORTFOLIO_DETAILS', { id: portfolioId }, false))
    if (result?.success) {
      setPortfolioDetails(result?.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (portfolioId) {
      getPortfolioDetails()
    }
  }, [portfolioId])

  return (
    <div className="panelCard ">
      <div className="panelCard_Heading">
        <h5>Information Panel</h5>
      </div>

      <div className="invester_panal">
        <div className="panal_text">
          <h4>No. of Investors</h4>
          {portfolioDetails ? <h4>{portfolioDetails?.investors}</h4> : <h4>0</h4>}
        </div>

        <div className="panal_text">
          <h4 className="fundPerformance"> Fund performance (%l Loss/Profit) TVL</h4>

          <div className="panal_data">
            <div className="panal_box">
              <PercentageChange
                changeStatus={portfolioDetails?.investmentPercentageChange?.changeStatus}
                percentageChange={portfolioDetails?.investmentPercentageChange?.percentageChange}
                toolTipText='Changes in last 1 month'
              />
            </div>
            {portfolioDetails ? (
              <h4>
                {divideBigNumber(portfolioDetails?.totalInvestedAmount?.$numberDecimal, tokenDecimals)} {tokenSymbol}
              </h4>
            ) : (
              <h4>0 USDC</h4>
            )}
          </div>
        </div>
      </div>
      <AssetsInfo portfolioDetails={portfolioDetails} loading={loading} />
    </div>
  )
}

export default InformationPanelCard
