/** `nps open`
 *
 * the particular way you open a browser changes based on your os
 *
 * windows: 'start'
 * osx:     'open'
 * linux:   'gnome-open' or 'google-chrome-stable'
 *
**/

const openBrowser = (()=> {
  const os = require('os').platform()
  const linuxWeb = 'google-chrome-stable' // 'gnome-open'

  switch (os) {
    case 'darwin':
      return 'open'
    case 'win32':
      return 'start'
    case 'linux':
      return linuxWeb
    default:
      return 'open'
  }
})()

module.exports = {
  default: 'nps open.web',
  web: openBrowser+' http://localhost:3000/',
}
