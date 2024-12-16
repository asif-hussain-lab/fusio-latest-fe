import useCopyClipboard from '../../../hooks/useCopyToClipboard'
import { CopyClip, TickIcon } from '../../../Assets/Images/Icons/SvgIcons'
import { customizeAddress } from '../../../Services/common.service'
import { memo, useState } from 'react'
import CustomTooltip from '../CustomTooltip/CustomTooltip'

const CopyAddress = ({ text }: any) => {
  const [setCopied] = useCopyClipboard()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copy = (data: string) => {
    setCopied(data)
  }

  const handleClick = () => {
    copy(text)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  return (
    <div className="d-flex">
      {customizeAddress(text)}
      <span style={{ cursor: 'pointer' }} className="onlyIcon" onClick={handleClick}>
        {!isCopied ? (
          <CustomTooltip className="copyTool" icon={<CopyClip />} text="Copy Wallet Address" />
        ) : (
          <CustomTooltip className="copyToolSuccess" icon={<TickIcon />} text="Wallet Address Copied" />
        )}
      </span>
    </div>
  )
}

export default memo(CopyAddress)
