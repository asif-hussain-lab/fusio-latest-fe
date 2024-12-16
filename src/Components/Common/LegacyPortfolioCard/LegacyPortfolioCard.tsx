import { LegacyPortfolioCardProps } from "../../../Utils/Interfaces"
import "./LegacyPortfolioCard.scss"

const LegacyPortfolioCard = (props: LegacyPortfolioCardProps) => {

    return (
        <div className='legacyPortfolioCard'>
            <div className='legacyPortfolioCard_Iconbox'>
                {props.icon}
            </div>
            <div className='legacyPortfolioCard_data'>
                <h5>{props.title}</h5>
                <h3>{props.no}</h3>
            </div>
        </div>
    )
}

export default LegacyPortfolioCard