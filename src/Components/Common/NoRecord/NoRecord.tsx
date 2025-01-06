import { ReactNode } from 'react'
import { Col, Container, Row, Spinner } from 'react-bootstrap'
import NoRecordI from '../../../Assets/Images/NoRecord.png'
import Shimmer from '../Shimmer/Shimmer'
import ShimmerCard from '../Shimmer/ShimmerCard'
import ShimmerRow from '../Shimmer/ShimmerRow'

const NoRecord = ({
  loading,
  text = 'Records',
  shimmerType,
}: {
  loading?: boolean
  text?: string
  shimmerType?: string
}) => {
  let content: ReactNode = null
  if (loading) {
    switch (shimmerType) {
      case 'table':
        content = (
          <div>
            {Array.from({ length: 5 }, (_, i) => (
              <ShimmerRow key={i} />
            ))}
          </div>
        )
        break
      case 'card':
        content = (
          <Row>
            {Array.from({ length: 3 }, (_, i) => (
              <Col key={i} xs={12} md={6} xxl={4}>
                <ShimmerCard />
              </Col>
            ))}
          </Row>
        )
        break
      case 'box':
        content = <Shimmer />
        break
      case 'loader':
        content = (
          <div className="no_record_found mt-5">
            <Spinner animation="border" variant="light" style={{ width: '4rem', height: '4rem' }} />
          </div>
        )
        break
      default:
        content = ''
    }
  } else {
    content = (
      <div className="no_record_found">
        <img src={NoRecordI} alt="No Record" />
        <h4 style={{color:'#5EBFA9'}}>No {text} Found</h4>
      </div>
    )
  }

  return <Container>{content}</Container>
}

export default NoRecord
