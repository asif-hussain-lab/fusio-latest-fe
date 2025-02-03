import React from "react";
import Img1 from '../../Assets/1.png'
import Img2 from '../../Assets/2.png'
import Img3 from '../../Assets/3.png'
import Img4 from '../../Assets/4.png'
import def from '../../Assets/def.png'

const PortfolioImage = ({ heading }) => {
  let imageSrc;

  switch (heading) {
    case "deHedge DAO Fund":
      imageSrc =Img3;
      break;
    case "CryptoFace Fund":
      imageSrc = Img1;
      break;
    case "Emerging Technologies":
      imageSrc = Img2;
      break;
    case "MONGO PORTFOLIO":
        imageSrc = Img4;
        break;
    default:
      imageSrc = def;
  }

  return <img src={imageSrc} alt={heading || "default"} />;
};

export default PortfolioImage;
