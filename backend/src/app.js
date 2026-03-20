import express from 'express'
import cors from 'cors'
import uploadRoutes from './routes/upload.js'
import queryRoutes from './routes/query.js'
import notebookRoutes from './routes/notebook.js'
import sourceRoutes from './routes/source.js'
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api/upload', uploadRoutes)
app.use('/api/query', queryRoutes)
app.use('/api/notebook', notebookRoutes)
app.use('/api/source', sourceRoutes)
// static file serving for generated files (audio/pdf)
app.use('/files', express.static('/tmp'))
app.get('/', (req, res) => res.json({ ok: true, msg: 'NotebookLM backend' }))
export default app
