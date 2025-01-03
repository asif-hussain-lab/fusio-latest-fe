import { Dispatch, useCallback, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { DollarIcon, IncomeIcon, InvestorIcon, SuitcaseIcon } from '../../../../Assets/svgImgs/svgImgs'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../../Services/common.service'
import './Dashboard.scss'
import DashboardCard from './DashboardCard/DashboardCard'

const Dashboard = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const tokenSymbol = useSelector((state: any) => state.token.tokenSymbol)
  const [transactionsData, setTransactionsData] = useState<any>({});
  const [incomeData, setIncomeData] = useState<any>({});
  const [investorsData, setInvestorsData] = useState<any>({});
  const [portfoliosData, setPortfoliosData] = useState<any>({});

  const getDashboardData = useCallback(
    async () => {
      let result: any = await dispatch(callApiGetMethod('GET_DASHBOARD_DATA', {}, false))
      if (result?.success) {
        setTransactionsData(result?.data?.transactionsDetails[0]);
        setIncomeData(result?.data?.incomeDetails[0])
        setPortfoliosData(result?.data?.portfolioDetails[0])
        setInvestorsData(result?.data?.totalInvestorsCount[0])
      }
    },
    [dispatch]
  )

  useEffect(() => {
    getDashboardData();
  }, [])

  const Carddata = [
    {
      icon: <DollarIcon />,
      name: 'Total Transactions',

      subItems: [
        {
          title: 'No. of Deposits',
          value: `${transactionsData?.depositCount ? transactionsData?.depositCount : '0'}`,
          title1: 'Amount',
          text1: `${divideBigNumber(
            transactionsData?.depositAmount?.$numberDecimal ? transactionsData?.depositAmount?.$numberDecimal : '0',
            tokenDecimals
          ) +
            ' ' +
            tokenSymbol
            }`,
          amount: true,
        },
        {
          title: 'No. of Withdrawals',
          value: `${transactionsData?.withdrawalCount ? transactionsData?.withdrawalCount : '0'}`,
          title1: 'Amount',
          text1: `${divideBigNumber(
            transactionsData?.withdrawalAmount?.$numberDecimal ? transactionsData?.withdrawalAmount?.$numberDecimal : '0',
            tokenDecimals
          ) +
            ' ' +
            tokenSymbol
            }`,
          amount: true,
        },
      ],
    },
    {
      icon: <IncomeIcon />,
      name: 'Income',
      total: '44,200',
      subItems: [
        {
          title: 'Net Income (Weekly)',
          value: `${divideBigNumber(
            incomeData?.weeklyTotalAdminAumFees ? incomeData?.weeklyTotalAdminAumFees?.$numberDecimal : '0',
            tokenDecimals
          ) +
            ' ' +
            tokenSymbol
            }`,
        },
        {
          title: 'Total Fees Collected',
          value: `${divideBigNumber(
            incomeData?.totalAdminAumFees ? incomeData?.totalAdminAumFees?.$numberDecimal : '0',
            tokenDecimals
          ) +
            ' ' +
            tokenSymbol
            }`,
        },
      ],
    },
    {
      icon: <InvestorIcon />,
      name: 'Investors',
      subItems: [
        {
          title: 'New Investors',
          value: `${investorsData?.totalInvestors ? investorsData?.totalInvestors : '0'}`,
          assetClass: 'w-100',
        },
      ],
    },
    {
      icon: <SuitcaseIcon />,
      name: 'No. of Portfolios',
      subItems: [
        {
          title: 'Total Portfolios',
          value: `${portfoliosData?.totalPortfolios ? portfoliosData?.totalPortfolios : '0'}`,
          assetClass: 'w-100',
        },
      ],
    },
  ]
  return (
    <div className="Dashboard">
      <Row>
        {Carddata.map((item: any,) => (
          <Col className='d-flex mb-4 mb-md-5' xxl={4} md={6} key={item.name}>
            <DashboardCard className="w-100" item={item}
            />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard
