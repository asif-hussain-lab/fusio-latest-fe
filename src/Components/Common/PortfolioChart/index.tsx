/* eslint-disable no-loop-func */
import CanvasJSReact from '@canvasjs/react-stockcharts'
import moment from 'moment'
import { Dispatch, memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { fixedToDecimal } from '../../../Services/common.service'
import Shimmer from '../Shimmer/Shimmer'
const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart

const PortfolioChart = ({ data }: any) => {
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [dataPointsForLineChart, setDataPointsForLineChart] = useState<any>([])

  useEffect(() => {
    setDataPointsForLineChart([])
    const fetchData = async () => {
      try {
        const currentDate = new Date()
        let obj: { user: string; portfolioId?: number } = {
          user: walletAddress,
        }
        if (data !== 'all') {
          obj.portfolioId = data?.portfolioId
        }
        let result: any = await dispatch(callApiGetMethod('GET_USER_PORTFOLIO_VALUE', obj, false))
        const currYear = new Date().getFullYear()
        if (result?.success) {
          let dataForLineGraph: any = []
          let dataAxis: any = {
            type: 'area',
            lineColor: '#B4FF00',
            xValueFormatString: 'DD/MM/YYYY',
            markerType: 'none',
            lineThickness: 2,
            axisYType: 'secondary',
          }
          let tempdata: any = []
          let curruntMonth = currentDate.getMonth()
          for (let i = 1; i <= 30; i++) {
            let curruntDay = currentDate.getDate() - (30 - i)
            const last12MonthsDate = new Date(currYear, curruntMonth, curruntDay)
            let copy = moment(last12MonthsDate).format('YYYY-MM-DD')
            tempdata.push({
              x: last12MonthsDate,
              y: result?.data.filter(({ date }) => moment(copy).isSame(moment(date))).length
                ? Number(
                    result?.data.filter(({ date }) => moment(copy).isSame(moment(date)))[0]?.totalValue?.$numberDecimal
                  )
                : undefined,
            })
          }
          dataAxis.dataPoints = tempdata
          dataForLineGraph.push(dataAxis)
          setDataPointsForLineChart(dataForLineGraph)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    data && fetchData()
  }, [dispatch, data, walletAddress])

  const options = {
    theme: 'dark2',
    backgroundColor: '#18749D',
    animationEnabled: true,
    title: {
      text: data === 'all' ? 'Total Investment' : data?.portfolioName,
      fontColor: '#fff',
      fontFamily: `"Open Sans", sans-serif`,
      fontSize: '18',
      fontWeight: 600,
      padding: 4,
    },
    charts: [
      {
        axisY2: {
          lineThickness: 1,
          labelFontSize: 12,
          labelFontColor: '#ccc',
          lineColor: '#B4FF00',
          gridThickness: 0,
          gridColor: '#001930',
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
          tickLength: 5,
          tickColor: '#B4FF00',
          lineThickness: 1,
          lineColor: '#B4FF00',
          labelFontSize: 12,
          labelFontColor: '#ccc',
          gridColor: '#001930',
          gridThickness: 0,
          valueFormatString: 'DD/MM',
          interval: 1,
          intervalType: 'day',
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
          },
        },
        toolTip: {
          shared: true,
          contentFormatter: function (e) {
            let content = ' '
            for (const element of e.entries) {
              let x = moment(element.dataPoint.x).format('YYYY-MM-DD')
              let y = element.dataPoint.y ? fixedToDecimal(element.dataPoint.y) : 0
              content += x + ': <strong>' + y + ' USDC </strong>'
              content += '<br/>'
            }
            return content
          },
        },
        data: dataPointsForLineChart.map((dataSeries, index) => ({
          ...dataSeries,
          type: 'area', // Smoothed area chart
          lineThickness: 3,
          fillOpacity: 0.3,
          markerSize: 8,
          color: '#5EBFA9',
        })),
      },
    ],
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      selectedRangeButtonIndex: 0,
      label: 'Range',
      buttons: [
        {
          range: 1,
          rangeType: 'week',
          label: '7 Days',
        },
        {
          rangeType: 'all',
          label: '30 days',
        },
      ],
      inputFields: {
        enabled: false,
      },
      buttonStyle: {
        spacing: 5,
        borderColor: '#B4FF00',
        backgroundColor: '#fff',
        backgroundColorOnHover: '#B4FF00',
        backgroundColorOnSelect: '#B4FF00',
        labelFontColor: '#18749D',
        labelFontColorOnHover: '#18749D',
        labelFontColorOnSelect: '#18749D',
        labelFontFamily: `"Open Sans", sans-serif`,
        labelFontWeight: 500,
      },
    },
  }
  const containerProps = {
    width: '100%',
    height: '470px',
    margin: 'auto',
  }

  return (
    <div>
      {dataPointsForLineChart?.length ? (
        <CanvasJSStockChart options={options} containerProps={containerProps} />
      ) : (
        <Shimmer />
      )}
    </div>
  )
}

export default memo(PortfolioChart)
