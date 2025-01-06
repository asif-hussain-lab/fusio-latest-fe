import './Footer.scss'

const Footer = () => {
  return (
    <div className="Footer">
      <p className="text-center" style={{color:'#5EBFA9'}}>© {new Date().getFullYear()} All rights reserved by BLOCKGUARD</p>
    </div>
  )
}

export default Footer
