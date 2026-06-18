import express, {
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import packagesRoutes from './routes/packages.js'
import institutionsRoutes from './routes/institutions.js'
import appointmentsRoutes from './routes/appointments.js'
import reportsRoutes from './routes/reports.js'
import statisticsRoutes from './routes/statistics.js'
import healthArchiveRoutes from './routes/health-archive.js'

import { errorHandler, notFoundHandler } from './middleware/error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/packages', packagesRoutes)
app.use('/api/institutions', institutionsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/health-archive', healthArchiveRoutes)

app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'ok',
  })
})

app.use(notFoundHandler)
app.use(errorHandler)

export default app
