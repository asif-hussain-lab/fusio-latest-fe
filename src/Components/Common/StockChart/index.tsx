/* eslint-disable no-loop-func */
import CanvasJSReact from '@canvasjs/react-charts'
import { Dispatch, memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../Redux/Actions/api.action'
import { divideBigNumber } from '../../../Services/common.service'
const CanvasJSChart = CanvasJSReact.CanvasJSChart

const StockChart = ({ id, priceType }: { id?: number; priceType?: string }) => {
  const dispatch: Dispatch<any> = useDispatch()
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const [dataPointsForLineChart, setDataPointsForLineChart] = useState<any>([])
  const colorSet = ['', '#47a1ff', '',]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = new Date()
        const currYear = new Date().getFullYear()
        let params: { id?: number; timeDuration?: string } = {}
        if (id) {
          params.id = id
          params.timeDuration = priceType
        }
        let result: any = await dispatch(
          callApiGetMethod(id ? 'GET_PORTFOLIO_INVESTMENT' : 'GET_ADMIN_INCOME_ANALYTICS', params, false)
        )
        if (result?.success) {
          let dataForLineGraph: any = []
          if (id) {
            try {
              switch (priceType) {
                case 'yearly': {
                  let dataAxis: any = {
                    type: 'spline',
                    lineColor: '#18749D',
                    toolTipContent: '{x}: {y}USDC',
                    xValueFormatString: 'MMM YYYY',
                    markerType: 'none',
                    lineThickness: 2,
                    axisYType: 'secondary',
                  }
                  let tempdata: any = []
                  for (let i = 1; i <= 12; i++) {
                    let curruntMonth = currentDate.getMonth() - (12 - i)
                    const last12MonthsDate = new Date(currYear, curruntMonth, 1)
                    tempdata.push({
                      x: last12MonthsDate,
                      y: result?.data?.ordersTrends.filter(
                        ({ month, year }) => month === curruntMonth + 1 && year === last12MonthsDate.getFullYear()
                      ).length
                        ? Number(
                          divideBigNumber(
                            result?.data?.ordersTrends.filter(
                              ({ month, year }) =>
                                month === curruntMonth + 1 && year === last12MonthsDate.getFullYear()
                            )[0]?.totalInvestment?.$numberDecimal,
                            tokenDecimals
                          )
                        )
                        : 0,
                    })
                  }
                  dataAxis.dataPoints = tempdata
                  dataForLineGraph.push(dataAxis)
                  break
                }
                case 'monthly': {
                  let dataAxis: any = {
                    type: 'spline',
                    lineColor: '#18749D',
                    toolTipContent: '{x}: {y}USDC',
                    xValueFormatString: 'DD MMM', // Format for monthly data
                    markerType: 'none',
                    lineThickness: 2,
                    axisYType: 'secondary',
                  }
                  let tempdata: any = []
                  const currMonth = currentDate.getMonth() // Get current month
                  const daysInCurrMonth = new Date(currYear, currMonth + 1, 0).getDate()
                  for (let i = 1; i <= daysInCurrMonth; i++) {
                    // let cuurentDay = currentDate.getDate() - (daysInCurrMonth - i)
                    const dayDate = new Date(currYear, currMonth, i)
                    tempdata.push({
                      x: dayDate,
                      y: result?.data?.ordersTrends.filter(({ day }) => day === i).length
                        ? Number(
                          divideBigNumber(
                            result?.data?.ordersTrends.filter(({ day }) => day === i)[0]?.totalInvestment
                              ?.$numberDecimal,
                            tokenDecimals
                          )
                        )
                        : 0,
                    })
                  }
                  dataAxis.dataPoints = tempdata
                  dataForLineGraph.push(dataAxis)
                  break
                }
                case 'weekly': {
                  let dataAxis: any = {
                    type: 'spline',
                    lineColor: '#18749D',
                    toolTipContent: '{x}: {y}USDC',
                    xValueFormatString: 'DD MMM', // Format for weekly data
                    markerType: 'none',
                    lineThickness: 2,
                    axisYType: 'secondary',
                  }
                  let tempdata: any = []
                  const daysInAWeek = 7
                  const currMonth = currentDate.getMonth()
                  const currDate = currentDate.getDate()
                  const dayOfWeek = currentDate.getDay()
                  const daysInPrevMonth = new Date(currYear, currMonth, 0).getDate()
                  for (let i = 1; i <= daysInAWeek; i++) {
                    let currentDay =
                      currDate - (daysInAWeek - i) > 0
                        ? currDate - (daysInAWeek - i)
                        : daysInPrevMonth + (currDate - (daysInAWeek - i))
                    const dayDate = new Date(currYear, currMonth, currDate - dayOfWeek + i - 2)
                    tempdata.push({
                      x: dayDate,
                      y: result?.data?.ordersTrends.filter(({ day }) => day === currentDay).length
                        ? Number(
                          divideBigNumber(
                            result?.data?.ordersTrends.filter(({ day }) => day === currentDay)[0]?.totalInvestment
                              ?.$numberDecimal,
                            tokenDecimals
                          )
                        )
                        : 0,
                    })
                  }
                  dataAxis.dataPoints = tempdata
                  dataForLineGraph.push(dataAxis)
                  break
                }
                case 'hourly': {
                  let dataAxis: any = {
                    type: 'spline',
                    lineColor: '#18749D',
                    toolTipContent: '{x}: {y}USDC',
                    xValueFormatString: 'HH:00', // Format for hourly data
                    markerType: 'none',
                    lineThickness: 2,
                    axisYType: 'secondary',
                  }
                  let tempdata: any = []
                  const hoursInADay = 24
                  const currentDate = new Date()
                  const currYear = currentDate.getFullYear()
                  const currMonth = currentDate.getMonth()
                  const currDate = currentDate.getDate()

                  for (let i = 1; i <= hoursInADay; i++) {
                    let currentHour =
                      currentDate.getHours() - (hoursInADay - i) >= 0
                        ? currentDate.getHours() - (hoursInADay - i)
                        : hoursInADay + currentDate.getHours() - (hoursInADay - i)
                    const hourDate = new Date(currYear, currMonth, currDate, currentHour)
                    tempdata.push({
                      x: hourDate,
                      y: result?.data?.ordersTrends.filter(({ hour }) => hour === currentHour).length
                        ? Number(
                          divideBigNumber(
                            result?.data?.ordersTrends.filter(({ hour }) => hour === currentHour)[0]?.totalInvestment
                              ?.$numberDecimal,
                            tokenDecimals
                          )
                        )
                        : 0,
                    })
                  }
                  dataAxis.dataPoints = tempdata
                  dataForLineGraph.push(dataAxis)
                  break
                }
              }
            } catch (error) {
              console.error('Error fetching data:', error)
            }
          } else {
            for (let j = 1; j <= 3; j++) {
              let dataAxis: any = {
                type: 'spline',
                lineColor: colorSet[j],
                toolTipContent: '{x}: {y}USDC',
                xValueFormatString: 'MMM YYYY',
                markerType: 'none',
                lineThickness: 2,
                axisYType: 'secondary',
                legend: {
                  fontColor: colorSet[j],
                },
                name: j === 1 ? 'Legecy Funds' : j === 2 ? 'Curated Funds' : 'Portfolio Builder',
                showInLegend: true,
              }
              let tempdata: any = []
              let dataForPortfolio = result?.data?.filter(({ portfolioType }) => portfolioType === j)
              for (let k = 1; k <= 12; k++) {
                let curruntMonth = currentDate.getMonth() - (12 - k)
                const last12MonthsDate = new Date(currYear, curruntMonth, 1)
                if (dataForPortfolio?.length) {
                  tempdata.push({
                    x: last12MonthsDate,
                    y: dataForPortfolio.filter(
                      ({ month, year }) => month === curruntMonth + 1 && year === last12MonthsDate.getFullYear()
                    ).length
                      ? Number(
                        divideBigNumber(
                          dataForPortfolio.filter(
                            ({ month, year }) => month === curruntMonth + 1 && year === last12MonthsDate.getFullYear()
                          )[0]?.totalAumFeesCollected?.$numberDecimal,
                          tokenDecimals
                        )
                      )
                      : 0,
                  })
                } else {
                  tempdata.push({
                    x: last12MonthsDate,
                    y: 0,
                  })
                }
              }
              dataAxis.dataPoints = tempdata
              dataForLineGraph.push(dataAxis)
            }
          }
          setDataPointsForLineChart(dataForLineGraph)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [dispatch, id, priceType, tokenDecimals])

  function getXAxisFormat() {
    try {
      if (id) {
        switch (priceType) {
          case 'yearly':
            return 'MMM YYYY'
          case 'monthly':
            return 'DD'
          case 'weekly':
            return 'DD MMM'
          case 'hourly':
            return 'HH:mm'
        }
      } else {
        return 'MMM YYYY'
      }
    } catch (error) { }
  }

  function getXIntervalType() {
    try {
      if (id) {
        switch (priceType) {
          case 'yearly':
            return 'month'
          case 'monthly':
          case 'weekly':
            return 'day'
          case 'hourly':
            return 'hour'
        }
      } else {
        return 'month'
      }
    } catch (error) { }
  }

  const options = {
    theme: 'dark1',
    height: 510,
    backgroundColor: '#F0F0F0',
    animationEnabled: true,
    axisY2: {
      lineThickness: 1,
      labelFontSize: 9,
      labelFontColor: '#0A222F',
      lineColor: '#0A222F',
      gridThickness: 0,
      gridColor: '#0A222F',
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
      tickColor: '#0A222F',
      lineThickness: 1,
      lineColor: '#0A222F',
      labelFontSize: 9,
      labelFontColor: '#0A222F',
      gridColor: '#0A222F',
      gridThickness: 0,
      valueFormatString: getXAxisFormat(),
      interval: 1,
      intervalType: getXIntervalType(),
      crosshair: {
        enabled: true,
        snapToDataPoint: true,
      },
    },
    data: dataPointsForLineChart,
  }

  return <div>{options ? <CanvasJSChart options={options} /> : ''}</div>
}

export default memo(StockChart)
