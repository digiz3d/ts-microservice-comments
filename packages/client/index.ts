import { format } from 'util'
import { EventEmitter } from 'events'
import axios from 'axios'
import { Kafka } from 'kafkajs'
import { nanoid } from 'nanoid'
import {
  Message,
  ENDPOINTS,
  TOPIC_FORMATS,
  ParseComment,
} from '@digiz3dtest/microservice-comments-common'

const { KAFKA_URL, SERVICE_URL } = process.env

if (!SERVICE_URL)
  throw new Error('missing SERVICE_URL variable for client to work')

if (!KAFKA_URL) throw new Error('missing KAFKA_URL variable for client to work')

const kafka = new Kafka({
  clientId: 'kafka-client-id' + Date.now(),
  brokers: [KAFKA_URL],
  ssl: false,
})
const consumer = kafka.consumer({ groupId: nanoid(), maxWaitTimeInMs: 10 })

export default class CommentsClient {
  async sendMessage(message: Message) {
    await axios.post(SERVICE_URL + ENDPOINTS.ADD_SHOW_COMMENT, message)
  }

  async getMessages() {
    const { data } = await axios.get<Message[]>(
      SERVICE_URL + ENDPOINTS.GET_SHOW_COMMENTS
    )
    return data
  }

  async subscribeToNewComments(showId: string) {
    await consumer.connect()
    await consumer.subscribe({
      topic: format(TOPIC_FORMATS.SHOW_COMMENT_CREATED, showId),
      fromBeginning: false,
    })

    const eventEmitter = new EventEmitter()

    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const msg = message.value?.toString()
          console.log(`Received message ${msg}`)
          eventEmitter.emit('message', ParseComment(msg!))
        },
      })
      .catch((err) => {
        console.error('error while running kafka consumer', err)
      })

    return eventEmitter
  }
}
