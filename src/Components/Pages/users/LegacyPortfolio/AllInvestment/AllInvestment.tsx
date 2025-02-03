import { memo, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { divideBigNumber, fixedToDecimal } from '../../../../../Services/common.service'
import './AllInvestment.scss'
import { AllInvestmentProps } from '../../../../../Utils/Interfaces'

const AllInvestment = ({ AllInvestedCard, callBack, setActiveKeyInner, selectedPf }: AllInvestmentProps) => {
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const ref: any = useRef()

  const onclick = () => {
    if (ref.current && document.body.clientWidth < 1199) {
      ref.current.click()
    }
  }

  console.log("callBack",callBack);

  const renderClass = useCallback(
    (data: any) => {
      const currentValue = fixedToDecimal(data?.portfolioCurruntValue) ?? '0'
      const investedAmount = divideBigNumber(data?.invesedAmount?.$numberDecimal, tokenDecimals) ?? '0'
      if (parseFloat(currentValue) > parseFloat(investedAmount)) {
        return 'green_text'
      } else if (parseFloat(currentValue) < parseFloat(investedAmount)) {
        return 'red_text'
      } else {
        return ''
      }
    },
    [tokenDecimals]
  )

  const handleCLick = async (data: any) => {
    callBack(data)
    setActiveKeyInner('selected')
  }

  return (
    <>
      {AllInvestedCard?.map((data: any) => (
        <div
          className={`allinvestment${data?.portfolioId === selectedPf?.portfolioId ? ' active' : ''}`}
          key={data?.portfolioId}
          onClick={() => handleCLick(data)}
        >
          <h4>
            <Link to={`/portfolioView?id=${data?.portfolioId}`} style={{color:'white'}}>{data?.portfolioName}</Link>
          </h4>
          <div className="allinvest_data">
            <div className="text-end ps-3">
              <p className={renderClass(data)}>
                {fixedToDecimal(data?.portfolioCurruntValue) || '0'} {tokenSymbol}
              </p>
              <p>
                {divideBigNumber(data?.invesedAmount?.$numberDecimal, tokenDecimals)} {tokenSymbol}
              </p>
            </div>
            <div className="invest_btn">
              <NavLink onClick={onclick} to={`/portfolioView?id=${data?.portfolioId}`} className="btn-style view-btn">
                View
              </NavLink>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(AllInvestment)
