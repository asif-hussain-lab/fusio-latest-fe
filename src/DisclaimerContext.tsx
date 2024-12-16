import React, { createContext, useState, useEffect, useContext } from 'react'

const DisclaimerContext = createContext({
  disclaimerAccepted: false,
  acceptDisclaimer: () => {},
})

export const DisclaimerProvider = ({ children }) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  useEffect(() => {
    const acceptedUntil = sessionStorage.getItem('disclaimerAcceptedUntil')
    if (acceptedUntil && new Date(acceptedUntil) > new Date()) {
      setDisclaimerAccepted(true)
    }
  }, [])

  const acceptDisclaimer = () => {
    setDisclaimerAccepted(true)
    const threeMonthsLater = new Date()
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    sessionStorage.setItem('disclaimerAcceptedUntil', threeMonthsLater.toISOString())
  }

  return (
    <DisclaimerContext.Provider value={{ disclaimerAccepted, acceptDisclaimer }}>{children}</DisclaimerContext.Provider>
  )
}

export const useDisclaimer = () => {
  return useContext(DisclaimerContext)
}
