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
import { useTheme } from '../../../../Utils/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const TvlGraph: React.FC = () => {
  const { theme } = useTheme()
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
  }, [])

  const data = {
    labels,
    pointStyle: false,
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: values,
        fill: true,
        backgroundColor: theme === 'dark' ? 'rgba(36, 36, 38, 0.4)' : '#c8e9e2',
        borderColor: theme === 'dark' ? '#ffffff' : '#5EBFA9',
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
        labels: {
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme === 'dark' ? '#333' : undefined,
        titleColor: theme === 'dark' ? '#fff' : undefined,
        bodyColor: theme === 'dark' ? '#fff' : undefined,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        ticks: {
          callback: (value) => `$${value}`,
          color: theme === 'dark' ? '#ffffff' : '#000000',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return <Line data={data} options={options} />
}

export default TvlGraph
