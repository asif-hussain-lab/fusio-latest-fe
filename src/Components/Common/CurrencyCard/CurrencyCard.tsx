import { FC } from 'react'
import './CurrencyCard.scss';
import { IoMdArrowDown, IoMdArrowUp } from 'react-icons/io'
import btcIcon from '../../../Assets/svgImgs/btcIcon.svg'
import fetIcon from '../../../Assets/svgImgs/fetIcon.svg'
import pepeIcon from '../../../Assets/svgImgs/pepeIcon.svg'

interface CurrencyCardProps {
  name: 'BTCB' | 'PEPE' | 'FET'
  coinValue: number
  avgValue: number
}

const CurrencyCard: FC<CurrencyCardProps> = ({ name, coinValue, avgValue }) => {
  const iconMap: Record<typeof name, string> = {
    BTCB: btcIcon,
    PEPE: pepeIcon,
    FET: fetIcon,
  }

  return (
    <div className="currencyCard">
      <img src={iconMap[name]} alt={`${name} icon`} />
      <p>
        {name} <span>({coinValue}%)</span>
      </p>
      <div>
        <p style={{ color: avgValue >= 0 ? 'green' : 'red' }}>{avgValue}%</p>
        {avgValue >= 0 ? <IoMdArrowUp style={{ color: 'green' }} /> : <IoMdArrowDown style={{ color: 'red' }} />}
      </div>
    </div>
  )
}

export default CurrencyCard
