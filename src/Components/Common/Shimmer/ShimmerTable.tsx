import { Placeholder } from 'react-bootstrap'
import './Shimmer.scss'

const ShimmerTable = ({
  fields
}: {
  fields?:Array<string>
}) => {
  return (
    <>
      <tr className="commonShimmer shimmerTable placeholder-glow">
        {fields?.map((item) => (
          <td key={item}>
            <Placeholder />
          </td>
        ))}
      </tr>
    </>
  )
}

export default ShimmerTable
