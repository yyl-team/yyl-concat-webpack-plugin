class YylConcatWebpackPlugin {
  constructor() {}
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'yylConcat',
      (compilation, done) => {
        console.log(compilation.chunks.length)
        compilation.chunks.forEach((chunk) => {
          console.log(chunk.id, chunk.files)
        })



        Object.keys(compilation.assets).forEach((key) => {
          let cnt = compilation.assets[key].source()
          if (typeof cnt === 'string') {
            // cnt = cnt.replace(/(\w+)\.default\(/g, '$1[\'default\'](');
            // console.log('===', key)
            compilation.assets[key] = {
              source() {
                return cnt
              },
              size() {
                return cnt.length
              }
            }
          }
        })
        done()

        // compilation.hooks.emit.tapAsync('yylConcat', () => {
        //   console.log(compilation)
        //   // compilation.chunks.forEach((chunk) => {
        //   //   console.log('chunk.files ===', chunk.files)
        //   //   chunk.files.forEach((filename) => {
        //   //     console.log('===', filename)
        //   //   })
        //   // })
        //   // console.log(compilation.chunks)
          
        // })
      }
    )
  }
}

module.exports = YylConcatWebpackPlugin