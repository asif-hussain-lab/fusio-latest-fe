import { InjectedConnector } from '@wagmi/core'
import { walletConnectProvider } from '@web3modal/wagmi'
import { EIP6963Connector, createWeb3Modal } from '@web3modal/wagmi/react'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import Application from './Application'
import CommonButton from './Components/Common/Button/CommonButton'
import DisclaimerModal from './Components/Common/CommonModal/DisclaimerModal'
import Loader from './Components/Common/Loader'
import { useDisclaimer } from './DisclaimerContext'
import './Global.scss'
import store from './Redux/Store'
import { PROJECT_ID } from './Utils/constant'

const projectId = PROJECT_ID
const { chains, publicClient } = configureChains([bsc], [walletConnectProvider({ projectId }), publicProvider()])

const metadata = {
  name: 'Fusio Wealth Management Dapp',
  description: 'Fusio Wealth Management Dapp with Web3Modal v3 + Wagmi',
  url: 'https://app-fusio.blockguard.org',
  icons: ['../../../../Assets/Images/LogoIcon.png'],
}

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new EIP6963Connector({ chains }) as any,
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } }),
  ],
  publicClient,
})

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  defaultChain: chains[0],

  themeVariables: {
    '--w3m-color-mix': '#18749D',
    '--w3m-color-mix-strength': 10,
    '--w3m-font-family': '"Open Sans", sans-serif',
    '--w3m-border-radius-master': '2px',
    '--w3m-font-size-master': '14px',
  },
}) as any

/**CREATE STORE PERSIST INSTANCE */
const persistor = persistStore(store)

function App() {
  const { disclaimerAccepted, acceptDisclaimer } = useDisclaimer();

  return (
    <WagmiConfig config={wagmiConfig}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster />
          <Loader />
          {!disclaimerAccepted && (
            <DisclaimerModal
              show={!disclaimerAccepted}
              handleClose={acceptDisclaimer}
              heading="Disclaimer"
              msg="Before you proceed, please confirm the following:"
            >
              <p className="custom-p">
                You do not reside in, are not located in, are not incorporated in, and do not have a registered office
                or principal place of business in the United States.
              </p>
              {/* <button onClick={acceptDisclaimer}>Accept</button> */}
              <CommonButton onClick={acceptDisclaimer} title="Confirm" className="accept-button mt-4" />
            </DisclaimerModal>
          )}
          {disclaimerAccepted && <Application />}
        </PersistGate>
      </Provider>
    </WagmiConfig>
  )
}

export default App
