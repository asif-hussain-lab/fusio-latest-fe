import { Col, Container, Row } from 'react-bootstrap'
import Shimmer from '../Shimmer/Shimmer'
import ShimmerCard from '../Shimmer/ShimmerCard'
import ShimmerRow from '../Shimmer/ShimmerRow'
import NoRecordI from '../../../Assets/Images/NoRecordInvestment.png';

const NoRecordInvestment = ({
  loading,
  text = 'Records',
  isCard,
  shimmerType,
}: {
  loading?: boolean
  text?: string
  isCard?: boolean
  shimmerType?: string
}) => {
  let content: any = null
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
      default:
        content = ''
    }
  } else {
    content = (
      <div className="no_record_found">
        <img src={NoRecordI} alt="No Record" />
        <h4>No {text} Found</h4>
      </div>
    )
  }

  return <Container>{content}</Container>
}

export default NoRecordInvestment
