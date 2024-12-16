import { Link } from 'react-router-dom'
import "./AssetBoxCard.scss"
import { AssetBoxCardProps } from '../../../Utils/Interfaces'

const AssetBoxCard = (props: AssetBoxCardProps) => {
    return (
        <>
            <div className={`assetBoxcard ${props?.className}`}>
                <h6>
                    {props?.title}
                    {props?.link && (
                        <Link onClick={props?.onClick} to={props?.to}>{props?.linktext}</Link>
                    )}
                </h6>
                <h4>{props?.text}</h4>
                {props?.amount && (
                    <div className='mt-4'>
                        <h6>{props?.title1}</h6>
                        <h4>{props?.text1}</h4>
                    </div>
                )}
            </div>
        </>
    )
}

export default AssetBoxCard
