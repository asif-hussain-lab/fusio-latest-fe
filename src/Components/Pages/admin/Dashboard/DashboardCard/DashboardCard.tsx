import { Col, Row } from 'react-bootstrap'
import AssetBoxCard from '../../../../Common/AssetBoxCard/AssetBoxCard'
import './DashboardCard.scss'

const DashboardCard = ({ item, className }: { item: any;  className?:string}) => {
  return (
    <div className={`dashboard_card ${className || ''}`}>
      <div className="dashboard_card_inner">
        <div className="dashboard_card_inner_header">
          <span className="token_icon">{item.icon}</span>
          <h5>{item.name}</h5>
        </div>
        <div className="dashboard_card_inner_body">
          <Row>
            {item.subItems.map((item: any) => (
              <Col xs={6} sm={6} key={item.title} className={`d-flex ${item.assetClass}`}>
                <AssetBoxCard
                  title={item.title}
                  text={item.value}
                  amount={item.amount}
                  title1={item.title1}
                  text1={item.text1}
                  className="w-100"
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
