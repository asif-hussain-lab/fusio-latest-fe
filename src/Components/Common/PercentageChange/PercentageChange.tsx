import { DownbigarrowIcon, UpbigarrowIcon } from '../../../Assets/svgImgs/svgImgs'
import CustomTooltip from '../CustomTooltip/CustomTooltip';

const PercentageChange = ({
  changeStatus,
  percentageChange,
  toolTipText ,
}: {
  changeStatus: string
  percentageChange: string
  toolTipText?:string}) => {
  return (
    <CustomTooltip
      className="percentageToolTip"
      icon={
        <>
          {changeStatus === 'up' && (
            <span className="green_text">
              {percentageChange} <UpbigarrowIcon />
            </span>
          )}
          {changeStatus === 'down' && (
            <span className="red_text">
              {percentageChange} <DownbigarrowIcon />
            </span>
          )}
          {changeStatus === 'unchanged' && <span>{percentageChange}</span>}
        </>
      }
      text={toolTipText ?? 'Changes in last 1 hour'}
    />
  )
}

export default PercentageChange
