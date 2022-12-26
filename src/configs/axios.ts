// set defaults axios config for Next.js
import axios from 'axios'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL
axios.defaults.headers.post['Content-Type'] = 'application/json'

export default axios
