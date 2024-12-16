import CanvasJSReact from '@canvasjs/react-charts'
import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../Services/common.service'

const CanvasJSChart = CanvasJSReact.CanvasJSChart

const BarChart = () => {
  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const [dataPoints, setDataPoints] = useState<any>([])

  const fetchData = async () => {
    try {
      const currentDate = new Date()
      let result: any = await dispatch(callApiGetMethod('GET_INVESTMENT_TRENDS', {}, false))
      const currYear = new Date().getFullYear()
      if (result?.success) {
        let dataAxis: any = []

        for (let i = 1; i <= 12; i++) {
          let curruntMonth = currentDate?.getMonth() - (12 - i)
          const last12MonthsDate = new Date(currYear, curruntMonth, 1)
          dataAxis.push({
            x: last12MonthsDate,
            y: result?.data?.ordersTrends.filter(
              ({ month, year }) => month === curruntMonth + 1 && year === last12MonthsDate?.getFullYear()
            ).length
              ? Number(
                divideBigNumber(
                  result?.data?.ordersTrends.filter(
                    ({ month, year }) => month === curruntMonth + 1 && year === last12MonthsDate?.getFullYear()
                  )[0]?.totalInvestment?.$numberDecimal,
                  tokenDecimals
                )
              )
              : 0,
          })
        }
        setDataPoints(dataAxis)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [dispatch, tokenDecimals])

  const optionsBarGraph = {
    theme: 'dark2',
    height: 450,
    backgroundColor: '#18749D',
    animationEnabled: true,
    axisY: {
      lineThickness: 1,
      labelFontSize: 9,
      labelFontColor: '#ccc',
      lineColor: '#B4FF00',
      gridThickness: 0,
      gridColor: '#B4FF00',
      tickLength: 0,
      valueFormatString: '0.00 USDC',
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
        labelFormatter: function (e: any) {
          return e.value + ' USDC'
        },
      },
    },
    axisX: {
      intervalType: 'month',
      interval: 1,
      lineThickness: 1,
      labelFontSize: 9,
      labelFontColor: '#ccc',
      lineColor: '#B4FF00',
      gridThickness: 0,
      gridColor: '#B4FF00',
      tickLength: 0,
      valueFormatString: 'MMM YYYY',
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
    },
    dataPointWidth: 30,
    data: [
      {
        type: 'column',
        toolTipContent: '{x}: {y}USDC',
        xValueFormatString: 'MMM YYYY',
        bevelEnabled: true,
        labelFontSize: 10,
        color: '#B4FF00',
        lineColor: '#B4FF00',
        markerType: 'none',
        lineThickness: 0,
        dataPoints: dataPoints,
      },
    ],
  }
  return (
    <div style={{ borderRadius: '20px' }}>{optionsBarGraph?.data[0]?.dataPoints?.length ? <CanvasJSChart options={optionsBarGraph} /> : ''}</div>
  )
}

export default BarChart
