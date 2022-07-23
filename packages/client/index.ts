import axios from 'axios'
import { Message, ENDPOINTS } from '@digiz3dtest/microservice-comments-common'

const SERVICE_URL = process.env.SERVICE_URL

if (!SERVICE_URL) {
  throw new Error('missing SERVICE_URL variable for client to work')
}

export default class CommentsClient {
  async sendMessage(message: Message) {
    await axios.post(ENDPOINTS.ADD_SHOW_COMMENT, message)
  }
}
