import EventEmitter from 'events'
import Fastify from 'fastify'
import {
  ENDPOINTS,
  Message,
  StringifyComment,
} from '@digiz3dtest/microservice-comments-common'

const fastify = Fastify({ logger: false })

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

const eventEmitter = new EventEmitter()

const comments: Message[] = []

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
  eventEmitter.emit('show-comment-created', StringifyComment(newComment))
  return reply.send(newComment)
})

fastify.get(ENDPOINTS.GET_SHOW_COMMENTS, async (request, reply) => {
  return reply.send(comments)
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address}`)
})
