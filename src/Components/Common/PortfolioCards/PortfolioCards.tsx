import { FC } from 'react'
import './PortfolioCards.scss'
import PortfolioImage from '../PortfolioImage'

interface PortfolioCardProps {
  image: string
  name: string
  returnValue: number
}

const PortfolioCards: FC<PortfolioCardProps> = ({ image, name, returnValue }) => {
  return (
    <div className="portfolioCard">
      <PortfolioImage heading={name} />
      <h5>{name}</h5>
      <p>{returnValue}</p>
    </div>
  )
}

export default PortfolioCards
