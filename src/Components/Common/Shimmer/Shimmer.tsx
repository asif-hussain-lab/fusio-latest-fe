import { memo } from 'react'
import { Placeholder } from 'react-bootstrap'
import './Shimmer.scss'

const Shimmer = () => {
  return (
    <>
      <div className="commonShimmer shimmerChart">
        <Placeholder animation="glow" >
          <div>
            <Placeholder />
          </div>
        </Placeholder>
      </div>
    </>
  )
}

export default memo(Shimmer)
