class YylConcatWebpackPlugin {
  constructor() {}
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'yylConcat',
      (compilation, done) => {
        Object.keys(compilation.assets).forEach((key) => {
          let cnt = compilation.assets[key].source();
          if (typeof cnt === 'string') {
            // cnt = cnt.replace(/(\w+)\.default\(/g, '$1[\'default\'](');
            console.log('===', key)
            compilation.assets[key] = {
              source() {
                return cnt;
              },
              size() {
                return cnt.length;
              }
            };
          }
        });
        done();
      }
    );
  }
}

module.exports = YylConcatWebpackPlugin;