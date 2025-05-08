import { CoinListProps } from '../../../../../Utils/Interfaces'
import NoRecord from '../../../../Common/NoRecord/NoRecord'
import PercentageChange from '../../../../Common/PercentageChange/PercentageChange'
import './CoinList.scss'
import { useTheme } from '../../../../../Utils/ThemeContext'

const CoinList = (props: CoinListProps) => {
  function getToolTipText() {
    try {
      switch (props?.priceType) {
        case 'hourly':
          return 'Changes in last 1 hour'
        case 'weekly':
          return 'Changes in last 1 week'
        case 'monthly':
          return 'Changes in last 1 month'
        case 'yearly':
          return 'Changes in last 1 year'
      }
    } catch (error) {
      console.error('Error in getToolTipText: ', error)
    }
  }
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="coinList w-100">
      <div className="coin_card">
        <h4 style={{ color: theme === 'dark' ? 'white' : 'black' }}>Asset Allocation</h4>
      </div>
      <div className="coinList_listBox">
        {props?.assets ? (
          props?.assets?.map((item: any) => {
            if (item?.allocation > 0)
              return (
                <div className="CoinList_card" key={item.name}>
                  <div className="coin_info">
                    <img src={item?.icon} alt="Currency-Logo" className="currencyLogo" />
                    <h6>{item?.symbol}</h6>
                    <h6>{`(${item?.allocation / 100}%)`}</h6>
                  </div>
                  <div className="coin_info">
                    <PercentageChange
                      changeStatus={item?.priceState?.priceStatus}
                      percentageChange={item?.priceState?.percentageChange}
                      toolTipText={getToolTipText()}
                    />
                  </div>
                </div>
              )
          })
        ) : (
          <NoRecord loading={props?.loading} shimmerType="table" />
        )}
      </div>
    </div>
  )
}

export default CoinList
