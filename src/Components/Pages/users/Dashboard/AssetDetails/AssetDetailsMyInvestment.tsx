import { Dispatch, useCallback, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { callApiGetMethod } from '../../../../../Redux/Actions/api.action'
import NoRecord from '../../../../Common/NoRecord/NoRecord'
import { useTheme } from '../../../../../Utils/ThemeContext'

const AssetDetailsMyInvestment = ({ selectedPf, activeKeyInner }: { selectedPf?: any; activeKeyInner?: string }) => {
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const [allAllocations, setAllAllocations] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { theme } = useTheme()

  const getAllAllocations = useCallback(
    async (loading = true) => {
      try {
        if (loading) setLoading(true)
        let obj: { user?: string; portfolioId?: number } = {
          user: walletAddress,
        }
        if (activeKeyInner === 'selected' && selectedPf) {
          obj.portfolioId = selectedPf?.portfolioId
        }
        let result: any = await dispatch(callApiGetMethod('GET_INVESTMENT_ALLOCATIONS', obj, false))
        if (result?.success) {
          setAllAllocations(result?.data)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('Error occurred in getAllInvestments:', error)
      }
    },
    [dispatch, walletAddress, selectedPf, activeKeyInner]
  )

  useEffect(() => {
    getAllAllocations()
  }, [walletAddress, selectedPf, activeKeyInner])

  return (
    <div>
      {allAllocations?.length > 0 ? (
        <Row>
          {allAllocations?.map((item: any) => {
            const allocationPercent = selectedPf
              ? (item?.assetAllocation?.allocation / 100).toFixed(2)
              : (item?.allocationPercentage / 100).toFixed(2)
            const valueFormatted = parseFloat(item?.assetAllocation?.value).toFixed(6)
            return (
              <Col md={3} xs={12} key={selectedPf ? item?.tokenDetails?.symbol : item.token}>
                <div
                  className={`AssetDetail_card ${theme === 'dark' ? 'dark' : 'light'}`}
                  style={{ background: theme === 'dark' ? '#2D2C30' : '#FFFFFF' }}
                >
                  <a href={item?.tokenDetails?.exploreUrl} target="_blank" rel="noreferrer">
                    <div className="asset_info" style={{ position: 'relative' }}>
                      <img
                        src={item?.tokenDetails?.icon}
                        alt="Currency-Logo"
                        className="currencyLogo"
                        style={{
                          width: 53,
                          height: 53,
                          borderRadius: 18,
                        }}
                      />
                      <span className="ms-1" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                        {item?.assetAllocation?.trait_type}
                        <span
                          style={{
                            color: '#7D7D7D',
                            padding: '0 4px',
                            borderRadius: '4px',
                          }}
                        >
                          ({allocationPercent}%)
                        </span>
                      </span>
                    </div>
                  </a>{' '}
                  <div className="asset_info">
                    <div className="text-end" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                      <h6 style={{ color: theme === 'dark' ? 'white' : 'black' }}>{valueFormatted}</h6>
                      <h6 className="yellow_text">${parseFloat(item?.usdValue?.$numberDecimal ?? '0').toFixed(4)}</h6>
                    </div>
                  </div>
                </div>
              </Col>
            )
          })}
        </Row>
      ) : (
        <NoRecord loading={loading} shimmerType="box" />
      )}
    </div>
  )
}

export default AssetDetailsMyInvestment
