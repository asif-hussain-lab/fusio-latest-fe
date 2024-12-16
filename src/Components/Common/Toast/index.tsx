import './toast.scss'

import toast from 'react-hot-toast'

let options: any = {
  position: 'top-center',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  className:'toster-bar'
}

let lastMessage: string

class Toaster {
  success = (message: string) => {
    if (lastMessage !== message) {
      toast.success(message, options)
      lastMessage = message

      setTimeout(() => {
        lastMessage = ''
      }, options.autoClose)
    }
  }

  error = (message: string) => {
    if (lastMessage !== message) {
      toast.error(message, options)
      lastMessage = message

      setTimeout(() => {
        lastMessage = ''
      }, options.autoClose)
    }
  }
  info = (message: string) => {
    if (lastMessage !== message) {
      toast.success(message, options)
      lastMessage = message

      setTimeout(() => {
        lastMessage = ''
      }, options.autoClose)
    }
  }
}

export default new Toaster()
