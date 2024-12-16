import CanvasJSReact from '@canvasjs/react-charts'
import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { divideBigNumber, fixedToDecimal } from '../../../Services/common.service'
import NoRecord from '../NoRecord/NoRecord'

const CanvasJSChart = CanvasJSReact.CanvasJSChart

const PieChart = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const [dataPoints, setDataPoints] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)

  const getLabel = (portfolioType: number) => {
    try {
      switch (portfolioType) {
        case 1:
          return 'Legacy Funds'
        case 2:
          return 'Curated Funds'
        case 3:
          return 'Portfolio Builder'
        case 4:
          return 'Manage Portfolio'
        default:
          return ''
      }
    } catch (error) {
      console.error(`Unexpected  value: ${portfolioType}`)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        let result: any = await dispatch(callApiGetMethod('GET_AUM_FEES_DATA_FOR_EACH_PORTFOLIO', {}, false))
        if (result?.success) {
          let dp: any = result?.data?.map((item) => {
            let obj: any = {}
            obj.label = getLabel(item?.portfolioType)
            obj.y = Number(fixedToDecimal(item?.percentage?.$numberDecimal))
            obj.feesCollected = divideBigNumber(item?.adminAumFees?.$numberDecimal, tokenDecimals)
            return obj
          })
          setDataPoints(dp)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [dispatch, tokenDecimals])

  const options = {
    animationEnabled: true,
    interactivityEnabled: true,
    theme: 'dark1',
    backgroundColor: '#18749D',
    data: [
      {
        type: 'pie',
        explodeOnClick: false,
        indexLabel: '{label} {y}%',
        indexLabelPlacement: 'inside',
        toolTipContent: '<b>{label}</b>: {y}% <br/>{feesCollected} USDC',
        indexLabelMaxWidth: 150,
        indexLabelFontSize: 14,
        indexLabelFontWeight: 'bold',
        indexLabelFontColor: '#fff',
        radius: '90%',
        startAngle: -90,
        dataPoints: dataPoints,
      },
    ],
  }

  return (
    <div>
      {dataPoints?.length ? (
        <CanvasJSChart options={options} />
      ) : (
        <NoRecord text="Data for Transaction Fee" loading={loading} />
      )}
    </div>
  )
}

export default PieChart
