import './style.scss'

import { ThreeCircles } from 'react-loader-spinner'
import { useSelector } from 'react-redux'

/**LOADER COMPONENTS */
const Loader = () => {
  /**GET STATES FROM STORE */ 
  const isLoading = useSelector((state: any) => state.loader.isLoading)

  /**IF isLoading IS TRUE SHOW LOADER*/
  if (isLoading) {
    return (
      <div className="overlayloader">
        <ThreeCircles
          height="100"
          width="100"
          color="#6CC5AA"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="three-circles-rotating"
          outerCircleColor="#FAE170"
          innerCircleColor="#6CC5AA"
          middleCircleColor="#FAE170"
        />
      </div>
    )
  } else {
    return <></>
  }
}

export default Loader
