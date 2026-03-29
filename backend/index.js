const app = require('./api/server')
const { loadModules } = require('./core/moduleRegistry')

const PORT = process.env.PORT || 4000

loadModules()

app.listen(PORT, () => {
  console.log(`PyieLink backend running on port ${PORT}`)
})
