import { Link } from 'react-router-dom'
import "./CommonLink.scss"
import { CommonLinkProps } from '../../../Utils/Interfaces'

const CommonLink = (props: CommonLinkProps) => {
    return (
        <>
            <div className={`innerPagelink ${props?.className}`}>
                <Link onClick={props?.onClick} to={props?.to}>{props?.icon} {props?.text}</Link>
            </div>
        </>
    )
}

export default CommonLink
