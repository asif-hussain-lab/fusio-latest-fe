import { Col, Placeholder } from 'react-bootstrap'
import './Shimmer.scss'

const ShimmerCard = () => {

  const renderRow = (x: number, y: number, className?: string) => {
    return (
      <Placeholder className={`w-100 ${className}`} animation="glow">
        <div className="row justify-content-between">
          <Col xs={x} className='mb-2'>
            <Placeholder />
          </Col>
          <Col xs={y} className='mb-2'>
            <Placeholder />
          </Col>
        </div>
      </Placeholder>
    )
  }

  return (
    <>
      <div className="commonShimmer shimmerCard">
        <Placeholder className="row" animation="glow">
          <Col xs={8}>
            <Placeholder />
          </Col>
        </Placeholder>
        {renderRow(5, 4,'mt-4')}
        {renderRow(4, 3)}
        {renderRow(6, 2)}
        {renderRow(7, 2)}
        {renderRow(5, 2)}
      </div>
    </>
  )
}

export default ShimmerCard
