import { Link } from 'react-router-dom'
import './CuratedPortfolios.scss'
import cp_1 from '../../../Assets/cp_1.svg'
import cp_2 from '../../../Assets/cp_2.svg'
import cp_3 from '../../../Assets/cp_3.svg'
import cp_4 from '../../../Assets/cp_4.svg'
import cp_5 from '../../../Assets/cp_5.svg'

const CuratedPortfolios = () => {
  const data = [
    {
      id:1,
      icon: cp_1,
      heading: 'Connect Wallet:',
      text: 'Connect existing DEX wallet at the top right, or create a new one by clicking on your wallet of choice.',
    },
    {
      id:2,
      icon: cp_2,
      heading: 'Select Portfolio:',
      text: 'Explore curated portfolios, select the one according to your risk endurance.',
    },
    {
      id:3,
      icon: cp_3,
      heading: 'Confirm Investment:',
      text: 'Enter investment amount, as less as $10. Click on invest',
    },
    {
      id:4,
      icon: cp_4,
      heading: 'Check Growth:',
      text: "See your investment growing in 'my portfolio'.",
    },
    {
      id:5,
      icon: cp_5,
      heading: 'Rebalance Requests:',
      text: "Approve rebalance requests to update your portfolios accordingly.",
    },
  ]

  return (
    <div className="curatedPortfolios">
      <section>
        {data.map((el) => (
          <div key={el.id}>
            <figure>
              <img src={el.icon} alt="icon" />
            </figure>
            <p>{el.heading}</p>
            <p>{el.text}</p>
          </div>
        ))}
      </section>
      <div style={{marginTop: 'auto', padding: '1rem 0'}}>
        <Link className='btn-style' to="/addPortfolio?type=2">Create your own Portfolio</Link>
      </div>
    </div>
  )
}

export default CuratedPortfolios
