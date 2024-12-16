import { useSelector } from 'react-redux'
import { DownbigarrowIcon, UpbigarrowIcon } from '../../../Assets/svgImgs/svgImgs'
import { PRICE_STATE } from '../../../Utils/Utils'
import './InvestedCard.scss'
import { fixedToDecimal } from '../../../Services/common.service'
import { InvestedCardProps } from '../../../Utils/Interfaces'

const InvestedCard = (props: InvestedCardProps) => {
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const renderReturns = (data: any) => {
    const returnsNo = data

    if (returnsNo === '0') {
      return returnsNo
    }
    switch (returnsNo[0]) {
      case PRICE_STATE.UP:
        return (
          <span className="green_text">
            {fixedToDecimal(returnsNo[1])} {tokenSymbol}&nbsp;&nbsp;(
            <UpbigarrowIcon /> {returnsNo[2]})
          </span>
        )
      case PRICE_STATE.DOWN:
        return (
          <span className="red_text">
            {fixedToDecimal(returnsNo[1])} {tokenSymbol}&nbsp;&nbsp;(
            <DownbigarrowIcon /> {returnsNo[2]})
          </span>
        )
      case PRICE_STATE.UNCHANGED:
        return (
          <span className="white_text">
            {fixedToDecimal(returnsNo[1])} {tokenSymbol}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={`investedCard ${props?.className}`}>
      <div className="investedCard_inner">
        <div className="investedCard_inner_leftside">
          <div className="investedCard_inner_Content">
            <h6>{props?.value}</h6>
            <h3>{props?.name}</h3>
            <p>
              {props?.text} {props?.returnsNo && renderReturns(props?.returnsNo)}
            </p>
          </div>
        </div>
        <div className="investedCard_inner_rightside">{props?.amount && renderReturns(props?.amount)}</div>
      </div>
    </div>
  )
}

export default InvestedCard
