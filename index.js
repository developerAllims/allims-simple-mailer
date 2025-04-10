require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const { CORS_ORIGIN = '*' } = process.env

console.log(CORS_ORIGIN)

const corsOptions = {
  origin: CORS_ORIGIN.split(' '),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}
app.use(cors(corsOptions))

app.get('/', (req, res) => {
  const { version } = require('./package.json')
  res.send({ success: true, message: 'OK', version })
})

const nodemailer = require('nodemailer')

app.post('/', async (req, res) => {
  try {
    const { body = {} } = req
    const { from, to, subject, text, html } = body
    if (!from) throw new Error('Empty "from"')
    if (!to) throw new Error('Empty "to"')
    if (!subject) throw new Error('Empty "subject"')
    if (!text) throw new Error('Empty "text"')
    if (!html) throw new Error('Empty "html"')
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SEC } = process.env
    if (!SMTP_HOST) throw new Error('Empty "SMTP_HOST"')
    if (!SMTP_PORT) throw new Error('Empty "SMTP_PORT"')
    if (!SMTP_USER) throw new Error('Empty "SMTP_USER"')
    if (!SMTP_PASS) throw new Error('Empty "SMTP_PASS"')
    if (!SMTP_SEC) throw new Error('Empty "SMTP_SEC"')
    const smtp = {
      host: SMTP_HOST,
      port: Number.parseInt(SMTP_PORT),
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      secure: SMTP_SEC === 'true'
    }
    const transporter = nodemailer.createTransport(smtp)
    const data = {
      from,
      to,
      subject,
      text,
      html
    }
    await transporter.sendMail(data)
    res.send({ success: true, message: 'OK' })
  } catch (e) {
    res.status(500).send({ success: false, message: e.message })
  }
})

app.use((req, res, next) => {
  res.status(404).send({ success: false, message: 'Page not found' })
})

const { API_PORT = 3000 } = process.env

app.listen(API_PORT, () => {
  console.log(`API is running on http://127.0.0.1:${API_PORT}`)
})
