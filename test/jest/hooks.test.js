/* eslint-disable node/no-extraneous-require */
const extOs = require('yyl-os')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const util = require('yyl-util')
const extFs = require('yyl-fs')

jest.setTimeout(30000)

test('case hooks test', async () => {
  const targetPath = path.join(__dirname, '../case/hooks')
  const distPath = path.join(targetPath, 'dist')

  await extFs.removeFiles(distPath)
  await extFs.mkdirSync(distPath)

  if (!fs.existsSync(path.join(targetPath, 'node_modules'))) {
    await extOs.runSpawn('yarn install', targetPath)
  }

  process.chdir(targetPath)
  const wConfig = require(path.join(targetPath, 'webpack.config.js'))

  await util.makeAwait((done) => {
    webpack(wConfig, (err, stats) => {
      expect(err).toEqual(null)

      const info = stats.toJson()

      expect(info.errors.length).toEqual(0)
      expect(info.warnings.length).toEqual(0)
      done()
    })
  })
})
