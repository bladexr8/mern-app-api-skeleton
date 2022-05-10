import config from './../config/config'
import app from './express'
import mongoose from 'mongoose'

// Connection URL
// Docs - https://mongoosejs.com/docs/api.html#connection_Connection
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, {})
mongoose.connection.on('error', (err) => {
  console.log(err);
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})
mongoose.connection.on('connected', () => {
  console.log('*** Successfully connected to MongoDB...')
  console.log(`Id: ${mongoose.connection.id}`);
  console.log(`Host: ${mongoose.connection.host}`);
  console.log(`Port: ${mongoose.connection.port}`);
})

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})