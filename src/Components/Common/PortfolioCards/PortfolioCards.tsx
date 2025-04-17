import { FC } from 'react'
import './PortfolioCards.scss'
import PortfolioImage from '../PortfolioImage'

interface PortfolioCardProps {
  image: string
  name: string
  returnValue: number
  onClick?: () => void
}

const PortfolioCards: FC<PortfolioCardProps> = ({ image, name, returnValue, onClick }) => {
  return (
    <div className="portfolioCard" onClick={onClick} style={{ cursor: 'pointer' }}>
      <PortfolioImage heading={name} />
      <h5>{name}</h5>
      <p>{returnValue}</p>
    </div>
  )
}

export default PortfolioCards
