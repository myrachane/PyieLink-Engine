const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('pyielink', {
  apiBase: 'http://localhost:4000'
})
