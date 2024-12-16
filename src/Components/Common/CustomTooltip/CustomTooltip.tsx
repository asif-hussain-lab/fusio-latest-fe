import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import "./CustomTooltip.scss"
import { memo } from 'react'
import { CustomTooltipProps } from '../../../Utils/Interfaces'

const CustomTooltip = ({ placement, icon, text, className, toolclass }: CustomTooltipProps) => {
    return (
        
            <span className={`CustomTooltip ${className}`}>
                <OverlayTrigger
                    key={placement}
                    placement={placement}
                    delay={{ hide: 450, show: 300 }} 
                    overlay={
                        <Tooltip className={`tooltip ${toolclass}`}>
                            <strong>{text}</strong>
                        </Tooltip>
                    }
                >
                    <span>{icon}</span>
                </OverlayTrigger>
            </span>
        
    )
}

export default memo(CustomTooltip)