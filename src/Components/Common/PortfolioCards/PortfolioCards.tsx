import { FC } from 'react'
import './PortfolioCards.scss'

interface PortfolioCardProps {
  image: string
  name: string
  returnValue: number
}

const PortfolioCards: FC<PortfolioCardProps> = ({ image, name, returnValue }) => {
  return (
    <div className="portfolioCard">
      <img src={image} alt="profile" />
      <h5>{name}</h5>
      <p>{returnValue}</p>
    </div>
  )
}

export default PortfolioCards
