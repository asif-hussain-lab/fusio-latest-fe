import './WalletAddress.scss'
import NoRecord from '../../../../Common/NoRecord/NoRecord'
import { WalletAddressProps } from '../../../../../Utils/Interfaces'

const WalletAddress = ({ usersList, callback, selectedUser, loading }: WalletAddressProps) => {
  return (
    <div className="WalletAddress">
      <h3>Wallet Addresses</h3>
      {usersList?.length > 0 ? (
        <div className="assetinfo_card">
          {usersList?.map((item: any) => {
            return (
              <h5
                className={selectedUser === item.user ? 'active' : ''}
                key={item.user}
                onClick={() => {
                  callback(item.user)
                }}
              >
                {item.user}
              </h5>
            )
          })}
        </div>
      ) : (
        <NoRecord text="Investor" loading={loading} shimmerType='table'/>
      )}
    </div>
  )
}
export default WalletAddress
