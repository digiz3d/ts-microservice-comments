export type Message = {
  authorId: string
  showId: string
  text: string
}

export function ParseComment(json: string) {
  return JSON.parse(json) as Message
}

export function StringifyComment(comment: Message) {
  return JSON.stringify(comment)
}

export enum ENDPOINTS {
  ADD_SHOW_COMMENT = '/show-comments',
  GET_SHOW_COMMENTS = '/show-comments',
}
