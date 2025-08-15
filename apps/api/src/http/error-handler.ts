import type { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

import { BadRequestError } from './routes/_errors/bad-request-error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const fieldErrors = error.validation.reduce(
      (acc: Record<string, string[]>, issue) => {
        const fieldName = issue.instancePath.split('/').pop()
        if (fieldName) {
          if (!acc[fieldName]) {
            acc[fieldName] = []
          }
          acc[fieldName].push(issue.params.expected as string)
        }
        return acc
      },
      {},
    )

    return reply.status(400).send({
      message: 'Validation error',
      errors: fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
}
