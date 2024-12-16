import { Dispatch, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount } from 'wagmi'
import { callApiGetMethod } from '../../../../Redux/Actions/api.action'
import { callContractGetMethod, callContractSendMethod } from '../../../../Redux/Actions/contract.action'
import { ModalProps } from '../../../../Utils/Interfaces'
import { ERC721_INTERFACE_ID } from '../../../../Utils/constant'
import CustomSelect from '../../../Common/Select/Select'
import CommonButton from '../../Button/CommonButton'
import InputCustom from '../../Inputs/InputCustom'
import toaster from '../../Toast'
import CommonModal from '../CommonModal'
import './AddNftModal.scss'

export const AddNftModal = ({ show, handleClose }: ModalProps) => {
  const dispatch: Dispatch<any> = useDispatch()
  const walletAddress = useSelector((state: any) => state.user?.walletAddress)
  const { connector } = useAccount()
  const [nftAddress, setNftAddress] = useState<string>('')
  const [network, setNetwork] = useState<any>()
  const [networkList, setNetworkList] = useState<any>('')
  const [networks, setNetworks] = useState<any>('')

  const handleModalClose = () => {
    setNftAddress('')
    setNetwork('')
    handleClose()
  }
  const fetchNetworkDetails = async () => {
    let result: any = await dispatch(callApiGetMethod('GET_NETWORK_LIST', {}, false))
    if (result?.success) {
      setNetworks(result?.data)
      let networkOptions = result?.data?.map((item) => {
        return {
          value: item?.chainId,
          label: (
            <span
              dangerouslySetInnerHTML={{
                __html: `<img src=${item.icon} className="currencyLogo"/> ${item.chainType}`,
              }}
            />
          ),
        }
      })
      setNetworkList(networkOptions)
    }
  }

  const validateNftAddress = async () => {
    try {
      let selectedNetwork = networks?.filter((item: any) => parseInt(item?.chainId) === parseInt(network?.value))
      let rpc = selectedNetwork[0].rpc
      let result: any = await dispatch(
        callContractGetMethod(
          'supportsInterface',
          [ERC721_INTERFACE_ID],
          'prospectorNft',
          false,
          nftAddress,
          true,
          rpc
        )
      )
      return result
    } catch (error) {
      console.log('Error in getTokenStatus:', error)
    }
  }

  const whitelistNft = async (e:any) => {
    e.preventDefault()
    let nftStatus: any = await validateNftAddress()
    if (nftStatus) {
      let provider = await connector?.getProvider()
      let result: any = await dispatch(
        callContractSendMethod(
          provider,
          'addWhitelistNft',
          [nftAddress, parseInt(network.value)],
          walletAddress,
          'portfolio',
          'whitelistNft'
        )
      )
      if (result?.status) {
        handleModalClose()
        toaster.success('NFT whitelisted successfully')
      }
    }
  }

  useEffect(() => {
    fetchNetworkDetails()
  }, [])

  return (
    <CommonModal
      heading="Add NFT for Whitelisting"
      show={show}
      handleClose={handleModalClose}
      backdropClassName="transaction_modal_bckdrop"
      backdrop="static"
      className="addTokenModal"
    >
      <div className="commonContentModal">
        <form onSubmit={whitelistNft}>
          <Row>
            <Col xs={12}>
              <InputCustom
                id="nft"
                name="nft"
                label="NFT Contract Address"
                placeholder="Enter NFT Address"
                maxLength="43"
                required
                onChange={(e: any) => setNftAddress(e.target.value)}
                value={nftAddress}
              />
            </Col>
            <Col xs={12}>
              <label className="form-label" htmlFor="Asset">
                Chain
              </label>
              <CustomSelect
                defaultValue={networkList[0]}
                className="input_select img"
                isSearchable={false}
                name="chains"
                options={networkList}
                value={network}
                placeholder="Select Chain"
                onChange={(selectedOption: any) => {
                  setNetwork(selectedOption)
                }}
              />
            </Col>
          </Row>
          <div className="text-center mt-5">
            <CommonButton
              title="Add NFT"
              type="submit"
              buttonLoader={'whitelistNft'}
            />
          </div>
        </form>
      </div>
    </CommonModal>
  )
}
