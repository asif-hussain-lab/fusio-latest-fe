import NoRecord from '../../../../Common/NoRecord/NoRecord'
import PercentageChange from '../../../../Common/PercentageChange/PercentageChange'
import './AssetsInfo.scss'

const AssetsInfo = ({ portfolioDetails, loading }: { portfolioDetails:any; loading:boolean }) => {
  return (
    <div className="assetsInfo">
      <div className="coin_card">
        <h4>Underlying Assets Information</h4>
        <div className="asset_name">
          <h6>Asset Name</h6>
          <h6>%Gain/ Loss</h6>
        </div>
      </div>
      <div className="assetinfo_list">
        {portfolioDetails ? (
          portfolioDetails?.currencies?.map((item: any) => {
            if (item?.allocation > 0) return (
              <div className="assetinfo_card" key={item.name}>
                <div className="coin_info">
                  <img src={item?.icon} alt="Currency-Logo" className="currencyLogo" />
                  <h6>
                    {item?.name}
                    {` (${item?.allocation / 100}%)`}
                  </h6>
                </div>
                <div className="coin_data">
                  <PercentageChange
                    changeStatus={item?.priceState?.priceStatus}
                    percentageChange={item?.priceState?.percentageChange}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <NoRecord text="Portfolios" loading={loading} shimmerType="table" />
        )}
      </div>
    </div>
  )
}

export default AssetsInfo
