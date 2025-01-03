import { useFormik } from 'formik'
import { Dispatch, useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import * as Yup from 'yup'
import { callContractGetMethod, callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { logoutAdmin } from '../../../../Redux/Slices/admin.slice'
import { logoutUser } from '../../../../Redux/Slices/user.slice'
import {
  allowOnlyNumberWithDecimalsInput,
  convertWithDecimal,
  divideBigNumber,
  multiplyBigDigitsWithDecimals,
} from '../../../../Services/common.service'
import CommonButton from '../../../Common/Button/CommonButton'
import InputCustom from '../../../Common/Inputs/InputCustom'
import toaster from '../../../Common/Toast'
import './Settings.scss'
import { BYOP_AUM_FEE_RANGE } from '../../../../Utils/Utils'

const Settings = () => {
  const { connector } = useAccount()
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user.walletAddress)
  const tokenDecimals = useSelector((state: any) => state.token.tokenDecimals)
  const [minInvestment, setMinInvestment] = useState<number>()
  const [platformFee, setPlatformFee] = useState<number>()
  const [byopFee, setByopFee] = useState<number>()
  const [legacyReciever, setLegacyReciever] = useState<string>()
  const [cfReciever, setCFReciever] = useState<string>()
  const [ownerAddress, setOwnerAddress] = useState<string>()
  const [fuelFee, setFuelFee] = useState<number>()
  const [reBalancePortfolioFee, setReBalancePortfolioFee] = useState<number>()
  const [cryptoFuelFeeReceiver, setCryptoFuelFeeReceiver] = useState<string>()

  useEffect(() => {
    getAllDetails()
  }, [])

  const getAllDetails = async () => {
    try {
      await Promise.allSettled([
        getMinimumUsdc(),
        getPlatformFee(),
        getBYOPFee(),
        getLegacyReceiverAddress(),
        getCfReceiverAddress(),
        getCryptoFuelFeeReceiverAddress(),
        getOwnerAddress(),
        getFuelFee(),
        getRebalnceMyPortfolioFee(),
      ])
    } catch (error) {
      console.log('error', error)
    }
  }

  const getMinimumUsdc = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumUsdc', [], 'portfolio', false))
    if (result) {
      formik.setFieldValue('amount', divideBigNumber(result, tokenDecimals))
      setMinInvestment(divideBigNumber(result, tokenDecimals))
    }
  }

  const getPlatformFee = async () => {
    const result: any = await dispatch(callContractGetMethod('platformFees', [], 'portfolio', false))
    if (result) {
      formik.setFieldValue('platformFee', result / 100)
      setPlatformFee(result / 100)
    }
  }

  const getBYOPFee = async () => {
    const result: any = await dispatch(callContractGetMethod('BYOPFees', [], 'portfolio', false))
    if (result) {
      formik.setFieldValue('byopFee', result / 100)
      setByopFee(result / 100)
    }
  }

  const getCfReceiverAddress = async () => {
    let cfAddress: any = await dispatch(callContractGetMethod('CFReceiverAddress', [], 'portfolio', false))
    if (cfAddress) {
      formik.setFieldValue('cfAddress', cfAddress)
      setCFReciever(cfAddress)
    }
  }

  const getCryptoFuelFeeReceiverAddress = async () => {
    let cryptoFuelFeeReceiver: any = await dispatch(
      callContractGetMethod('cryptoFuelRecieverAddress', [], 'portfolio', false)
    )
    if (cryptoFuelFeeReceiver) {
      formik.setFieldValue('cryptoFuelFeeReceiver', cryptoFuelFeeReceiver)
      setCryptoFuelFeeReceiver(cryptoFuelFeeReceiver)
    }
  }

  const getLegacyReceiverAddress = async () => {
    let legacyAddress: any = await dispatch(
      callContractGetMethod('LegacyAndBYOPReceiverAddress', [], 'portfolio', false)
    )
    if (legacyAddress) {
      formik.setFieldValue('legacyAddress', legacyAddress)
      setLegacyReciever(legacyAddress)
    }
  }

  const getOwnerAddress = async () => {
    let ownerAddress: any = await dispatch(callContractGetMethod('owner', [], 'portfolio', false))
    if (ownerAddress) {
      formik.setFieldValue('ownerAddress', ownerAddress)
      setOwnerAddress(ownerAddress)
    }
  }

  const getFuelFee = async () => {
    const result: any = await dispatch(callContractGetMethod('minimumCryptoFuelFees', [], 'portfolio', false))
    if (result) {
      formik.setFieldValue('fuelFee', divideBigNumber(result, tokenDecimals, false))
      setFuelFee(divideBigNumber(result, tokenDecimals, false))
    }
  }

  const getRebalnceMyPortfolioFee = async () => {
    const result: any = await dispatch(
      callContractGetMethod('reBalancesMyPortfolioMinimumAmount', [], 'portfolio', false)
    )
    if (result) {
      formik.setFieldValue('reBalancePortfolioFee', divideBigNumber(result, tokenDecimals, false))
      setReBalancePortfolioFee(divideBigNumber(result, tokenDecimals, false))
    }
  }

  const updateOwnerAddress = async () => {
    if (formik.values.ownerAddress === ownerAddress) {
      toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'transferOwnership',
          [formik.values.ownerAddress],
          walletAddress,
          'portfolio',
          'ownerAddress'
        )
      )
      if (result?.status) {
        toaster.success('Ownership transferred successfully')
        getOwnerAddress()
        dispatch(logoutAdmin())
        dispatch(logoutUser())
      }
    }
  }

  const updateCryptoFuelFeeReceiverAddress = async () => {
    if (formik.values.cryptoFuelFeeReceiver === cryptoFuelFeeReceiver) {
      toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateCryptoFuelReciverAddress',
          [formik.values.cryptoFuelFeeReceiver],
          walletAddress,
          'portfolio',
          'cryptoFuelFeeReceiver'
        )
      )
      if (result?.status) {
        toaster.success('Crypto Fuel Fee Receiver updated successfully')
        getCryptoFuelFeeReceiverAddress()
      }
    }
  }

  const setMinimumUsdc = async () => {
    if (formik.values.amount <= 0) {
      toaster.error('Input value should be greater than zero')
    } else if (formik.values.amount === minInvestment) {
      toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      const result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateMinimumUsdc',
          [convertWithDecimal(formik.values.amount, tokenDecimals)],
          walletAddress,
          'portfolio',
          'minInvest'
        )
      )
      if (result?.status) {
        toaster.success('Minimum Investment Updated Successfully')
        getMinimumUsdc()
      }
    }
  }

  const updatePlatformFee = async () => {
    if (formik.values.platformFee <= 0) {
      toaster.error('Input value should be greater than zero')
    } else if (formik.values.platformFee > 50) {
      toaster.error('Platform Fee should be less than 50%')
    } else if (formik.values.platformFee === platformFee) {
      toaster.error('Value is same as the previous value')
    } else {
      let feeAmount = parseInt(multiplyBigDigitsWithDecimals(formik.values.platformFee.toString(), '100'))
      let provider = await connector?.getProvider()
      const result: any = await dispatch(
        callContractSendMethod(provider, 'updatePlatformFees', [feeAmount], walletAddress, 'portfolio', 'platformFee')
      )
      if (result?.status) {
        toaster.success('Platform Fee Updated Successfully')
        getPlatformFee()
      }
    }
  }

  const setBYOPFee = async () => {
    if (formik?.values?.byopFee < BYOP_AUM_FEE_RANGE.MIN || formik?.values?.byopFee > BYOP_AUM_FEE_RANGE.MAX) {
      return toaster.error(`BYOP fees must range from ${BYOP_AUM_FEE_RANGE.MIN}% to ${BYOP_AUM_FEE_RANGE.MAX}%.`)
    } else if (formik.values.byopFee === byopFee) {
      return toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      let byopAmount = parseInt(multiplyBigDigitsWithDecimals(formik.values.byopFee.toString(), '100'))
      const result: any = await dispatch(
        callContractSendMethod(provider, 'updateBYOPFees', [byopAmount], walletAddress, 'portfolio', 'byopFee')
      )
      if (result?.status) {
        toaster.success('BYOP Fee Updated Successfully')
        getBYOPFee()
      }
    }
  }

  const setReceiverAddress = async (type: string) => {
    let result: any
    switch (type) {
      case 'cf':
        if (formik.values.cfAddress === cfReciever) {
          return toaster.error('Value is same as the previous value')
        } else {
          let provider = await connector?.getProvider()
          result = await dispatch(
            callContractSendMethod(
              provider,
              'updateCFReciverAddress',
              [formik.values.cfAddress],
              walletAddress,
              'portfolio',
              'cfAddress'
            )
          )
          if (result?.status) {
            toaster.success('CF reciever address updated successfully')
            getCfReceiverAddress()
          }
        }
        break
      case 'legacyAndByop':
        if (formik.values.legacyAddress === legacyReciever) {
          return toaster.error('Value is same as the previous value')
        } else {
          let provider = await connector?.getProvider()
          result = await dispatch(
            callContractSendMethod(
              provider,
              'updateLegacyAndBYOPRecieverAddress',
              [formik.values.legacyAddress],
              walletAddress,
              'portfolio',
              'legacyAddress'
            )
          )
          if (result?.status) {
            toaster.success('BYOP/Legacy reciever address updated successfully')
            getLegacyReceiverAddress()
          }
        }
        break
    }
  }

  const updateFuelFee = async () => {
    if (formik.values.fuelFee <= 0) {
      toaster.error('Input value should be greater than zero')
    } else if (formik.values.fuelFee === fuelFee) {
      toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      const result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateMinimumCryptoFuelFees',
          [convertWithDecimal(formik.values.fuelFee, tokenDecimals)],
          walletAddress,
          'portfolio',
          'fuelFee'
        )
      )
      if (result?.status) {
        toaster.success('Fuel Fee Updated Successfully')
        getFuelFee()
      }
    }
  }

  const updateRebalnceMyPortfolioFee = async () => {
    if (formik.values.reBalancePortfolioFee <= 0) {
      toaster.error('Input value should be greater than zero')
    } else if (formik.values.reBalancePortfolioFee === reBalancePortfolioFee) {
      toaster.error('Value is same as the previous value')
    } else {
      let provider = await connector?.getProvider()
      const result: any = await dispatch(
        callContractSendMethod(
          provider,
          'updateReBalancesMyPortfolioMinimumFees',
          [convertWithDecimal(formik.values.reBalancePortfolioFee, tokenDecimals)],
          walletAddress,
          'portfolio',
          'reBalancePortfolioFee'
        )
      )
      if (result?.status) {
        toaster.success('Rebalance Portfolio Fee Updated Successfully')
        getRebalnceMyPortfolioFee()
      }
    }
  }

  const validationSchema = Yup.object().shape({
    amount: Yup.number().required('*This Field is required'),
    platformFee: Yup.number().required('*This Field is required'),
    byopFee: Yup.number().required('*This Field is required'),
    legacyAddress: Yup.string().required('*This Field is required'),
    cfAddress: Yup.string().required('*This Field is required'),
    ownerAddress: Yup.string().required('*This Field is required'),
    cryptoFuelFeeReceiver: Yup.string().required('*This Field is required'),
    fuelFee: Yup.number().required('*This Field is required'),
    reBalancePortfolioFee: Yup.number().required('*This Field is required'),
  })

  const formik = useFormik({
    initialValues: {
      amount: 0,
      platformFee: 0,
      byopFee: 0,
      legacyAddress: '',
      cfAddress: '',
      ownerAddress: '',
      cryptoFuelFeeReceiver: '',
      activeInput: '',
      fuelFee: 0,
      reBalancePortfolioFee: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      switch (values.activeInput) {
        case 'setMinimumUsdc':
          setMinimumUsdc()
          break
        case 'updatePlatformFee':
          updatePlatformFee()
          break
        case 'setBYOPFee':
          setBYOPFee()
          break
        case 'setLegacyAndByopReceiverAddress':
          setReceiverAddress('legacyAndByop')
          break
        case 'setCfReceiverAddress':
          setReceiverAddress('cf')
          break
        case 'cryptoFuelFeeReceiver':
          updateCryptoFuelFeeReceiverAddress()
          break
        case 'updateOwnerAddress':
          updateOwnerAddress()
          break
        case 'updateFuelFee':
          updateFuelFee()
          break
        case 'reBalancePortfolioFee':
          updateRebalnceMyPortfolioFee()
          break
        default:
          break
      }
    },
  })

  const handleClick = (newValue) => {
    formik.setFieldValue('activeInput', newValue)
  }

  return (
    <Container fluid>
      <form onSubmit={formik.handleSubmit}>
        <section className="settings_page">
          <Row className="gy-4">
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Minimum Investment (USDC)"
                  placeholder="Enter Amount"
                  id="amount"
                  name="amount"
                  nativeCurrency
                  onChange={(e) => {
                    let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 8)
                    isValid && formik.handleChange(e)
                  }}
                  value={formik.values.amount}
                  isInvalid={formik.touched.amount && !!formik.errors.amount}
                  error={
                    formik.errors.amount && formik.touched.amount ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.amount}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    onClick={() => handleClick('setMinimumUsdc')}
                    fluid
                    buttonLoader={'minInvest'}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Crypto Fuel Fee (USDC)"
                  placeholder="Enter Amount"
                  id="fuelFee"
                  name="fuelFee"
                  nativeCurrency
                  onChange={(e) => {
                    let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 8)
                    isValid && formik.handleChange(e)
                  }}
                  value={formik.values.fuelFee}
                  isInvalid={formik.touched.fuelFee && !!formik.errors.fuelFee}
                  error={
                    formik.errors.fuelFee && formik.touched.fuelFee ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.fuelFee}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    onClick={() => handleClick('updateFuelFee')}
                    fluid
                    buttonLoader={'fuelFee'}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Rebalance Portfolio Fee (USDC)"
                  placeholder="Enter Amount"
                  id="reBalancePortfolioFee"
                  name="reBalancePortfolioFee"
                  nativeCurrency
                  onChange={(e) => {
                    if (e.target.value <= 100) {
                      let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 8)
                      isValid && formik.handleChange(e)
                    }
                  }}
                  value={formik.values.reBalancePortfolioFee}
                  isInvalid={formik.touched.reBalancePortfolioFee && !!formik.errors.reBalancePortfolioFee}
                  error={
                    formik.errors.reBalancePortfolioFee && formik.touched.reBalancePortfolioFee ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.reBalancePortfolioFee}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'reBalancePortfolioFee'}
                    onClick={() => handleClick('reBalancePortfolioFee')}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Platform Fee %"
                  placeholder="Enter Amount"
                  id="platformFee"
                  name="platformFee"
                  onChange={(e) => {
                    if (e.target.value <= 100) {
                      let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                      isValid && formik.handleChange(e)
                    }
                  }}
                  value={formik.values.platformFee}
                  isInvalid={formik.touched.platformFee && !!formik.errors.platformFee}
                  error={
                    formik.errors.platformFee && formik.touched.platformFee ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.platformFee}
                      </span>
                    ) : null
                  }
                >
                  <span className="allocP">%</span>
                </InputCustom>
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    onClick={() => handleClick('updatePlatformFee')}
                    type="submit"
                    fluid
                    buttonLoader={'platformFee'}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="BYOP Fee %"
                  placeholder="Enter Amount"
                  id="byopFee"
                  name="byopFee"
                  onChange={(e) => {
                    if (e.target.value <= 100) {
                      let isValid = allowOnlyNumberWithDecimalsInput(e.target.value, 2)
                      isValid && formik.handleChange(e)
                    }
                  }}
                  value={formik.values.byopFee}
                  isInvalid={formik.touched.byopFee && !!formik.errors.byopFee}
                  error={
                    formik.errors.byopFee && formik.touched.byopFee ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.byopFee}
                      </span>
                    ) : null
                  }
                >
                  <span className="allocP">%</span>
                </InputCustom>
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'byopFee'}
                    onClick={() => handleClick('setBYOPFee')}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Receiver Address for Legacy/BYOP portfolio"
                  placeholder="Enter address"
                  id="legacyAddress"
                  name="legacyAddress"
                  maxLength={42}
                  onChange={(e: any) => {
                    formik.handleChange(e)
                  }}
                  value={formik.values.legacyAddress}
                  isInvalid={formik.touched.legacyAddress && !!formik.errors.legacyAddress}
                  error={
                    formik.errors.legacyAddress && formik.touched.legacyAddress ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.legacyAddress}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'legacyAddress'}
                    onClick={() => handleClick('setLegacyAndByopReceiverAddress')}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Receiver Address for CF portfolio"
                  placeholder="Enter address"
                  id="cfAddress"
                  name="cfAddress"
                  maxLength={42}
                  onChange={(e: any) => {
                    formik.handleChange(e)
                  }}
                  value={formik.values.cfAddress}
                  isInvalid={formik.touched.cfAddress && !!formik.errors.cfAddress}
                  error={
                    formik.errors.cfAddress && formik.touched.cfAddress ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.cfAddress}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'cfAddress'}
                    onClick={() => handleClick('setCfReceiverAddress')}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Ownership"
                  placeholder="Enter address"
                  id="ownerAddress"
                  name="ownerAddress"
                  maxLength={42}
                  onChange={(e: any) => {
                    formik.handleChange(e)
                  }}
                  value={formik.values.ownerAddress}
                  isInvalid={formik.touched.ownerAddress && !!formik.errors.ownerAddress}
                  error={
                    formik.errors.ownerAddress && formik.touched.ownerAddress ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.ownerAddress}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'ownerAddress'}
                    onClick={() => handleClick('updateOwnerAddress')}
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6} lg={4} className="d-flex">
              <div className="settings_page_box w-100">
                <InputCustom
                  label="Receiver Address for Crypto Fuel Fee "
                  placeholder="Enter address"
                  id="cryptoFuelFeeReceiver"
                  name="cryptoFuelFeeReceiver"
                  maxLength={42}
                  onChange={(e: any) => {
                    formik.handleChange(e)
                  }}
                  value={formik.values.cryptoFuelFeeReceiver}
                  isInvalid={formik.touched.cryptoFuelFeeReceiver && !!formik.errors.cryptoFuelFeeReceiver}
                  error={
                    formik.errors.cryptoFuelFeeReceiver && formik.touched.cryptoFuelFeeReceiver ? (
                      <span className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.cryptoFuelFeeReceiver}
                      </span>
                    ) : null
                  }
                />
                <div className="mt-4">
                  <CommonButton
                    title="Change"
                    type="submit"
                    fluid
                    buttonLoader={'cryptoFuelFeeReceiver'}
                    onClick={() => handleClick('cryptoFuelFeeReceiver')}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </section>
      </form>
    </Container>
  )
}

export default Settings
