import 'dotenv/config'

import Fastify from 'fastify'
import {
  ENDPOINTS,
  Message,
  StringifyComment,
  TOPIC_FORMATS,
} from '@digiz3dtest/microservice-comments-common'
import { Kafka } from 'kafkajs'
import { format } from 'util'

const { KAFKA_URL } = process.env

if (!KAFKA_URL)
  throw new Error('missing KAFKA_URL variable for service to work')

const kafka = new Kafka({
  clientId: 'kafka-service-id' + Date.now(),
  brokers: [KAFKA_URL],
  ssl: false,
})
const producer = kafka.producer()

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
const comments: Message[] = []

const fastify = Fastify({ logger: false })

fastify.get('/', async (request, reply) => {
  return { ok: true }
})

fastify.post(ENDPOINTS.ADD_SHOW_COMMENT, async (request, reply) => {
  const newComment = request?.body as Message
  if (!newComment) {
    return reply.code(400).send({ error: 'No json body' })
  }
  if (!newComment.authorId || !newComment.showId || !newComment.text) {
    return reply.code(400).send({ error: 'Missing required fields' })
  }

  comments.push(newComment)

  producer
    .send({
      topic: format(TOPIC_FORMATS.SHOW_COMMENT_CREATED, newComment.showId),
      messages: [{ value: StringifyComment(newComment) }],
    })
    .catch((err) => {
      console.error('error while publishing to kafka', err)
    })

  return reply.send(newComment)
})

fastify.get(ENDPOINTS.GET_SHOW_COMMENTS, async (request, reply) => {
  return reply.send(comments)
})

fastify.listen({ port: PORT }, async (err, address) => {
  if (err) throw err
  await producer.connect()
  console.log(`server listening on ${address}`)
})
