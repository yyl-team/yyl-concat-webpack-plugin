const util = require('yyl-util')
const path = require('path')
const extOs = require('yyl-os')
const fs = require('fs')

const handle = {
  async watch({ env }) {
    const targetPath = path.resolve(process.cwd(), env.path)
    if (!fs.existsSync(path.join(targetPath, 'node_modules'))) {
      await extOs.runSpawn('npm i', targetPath)
    }
    await extOs.runSpawn('npm run d', targetPath)
  },
  async all({ env }) {
    const targetPath = path.resolve(process.cwd(), env.path)
    if (!fs.existsSync(path.join(targetPath, 'node_modules'))) {
      await extOs.runSpawn('npm i', targetPath)
    }
    await extOs.runSpawn('npm run all', targetPath)
  }
}

const cmder = () => {
  const { env, cmds } = util.cmdParse(process.argv)
  handle[cmds[0]]({ env })
}

cmder()