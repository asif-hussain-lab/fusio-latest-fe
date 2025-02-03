import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const TvlGraph: React.FC = () => {
  const [labels, setLabels] = useState<string[]>([])
  const [values, setValues] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_KEY = '1062c7b485086c2a43f63ebc4c9934d38821ce06e0dad8f6f25f91dd40c056cb'
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=100&api_key=${API_KEY}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()

        // Process API response
        const data = result.Data.Data

        const newLabels = data.map((item: any) =>
          new Date(item.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
        const newValues = data.map((item: any) => item.close)

        setLabels(newLabels)
        setValues(newValues)
      } catch (error) {
        console.error('Error fetching data from CryptoCompare:', error)
      }
    }

    fetchData()
    // const fetchCryptoData = async () => {
    //   try {
    //     const response = await fetch(
    //       'https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=30&api_key=1062c7b485086c2a43f63ebc4c9934d38821ce06e0dad8f6f25f91dd40c056cb'
    //     )

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! Status: ${response.status}`)
    //     }

    //     const result = await response.json()
    //     console.log(result.Data.Data)
    //     //setData(result.Data.Data) // Assuming the data is in result.Data.Data
    //   } catch (error) {
    //     //setError(error.message)
    //   } finally {
    //     // setLoading(false)
    //   }
    // }

    // fetchCryptoData()
  }, [])

  const data = {
    labels,
    pointStyle: false,
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: values,
        fill: true,
        backgroundColor: '#c8e9e2',
        borderColor: '#5EBFA9',
        pointRadius: 0, // Hides the points
        pointHoverRadius: 5, // Optional: Adjust hover radius
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
        },
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  }

  return <Line data={data} options={options} />
}

export default TvlGraph
