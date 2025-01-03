import { Col, Placeholder, Row } from 'react-bootstrap'
import './Shimmer.scss'

const ShimmerRow = () => {
  return (
    <div className="commonShimmer shimmerRow w-100 mb-3">
        <Placeholder className="w-100 py-3" animation="glow">
          <div className="row justify-content-between">
            <Col xs={3} className="">
              <Placeholder />
            </Col>
            <Col xs={7} className="">
              <Row>
                <Col xs={6} className="">
                  <Placeholder />
                </Col>
                <Col xs={6} className="">
                  <Placeholder />
                </Col>
              </Row>
            </Col>
          </div>
        </Placeholder>
      </div>
  )
}

export default ShimmerRow
