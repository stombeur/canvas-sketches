module.exports = function(api) {
  api.cache(false);
  return {
    presets: [
      require('@babel/preset-typescript'),
    ],
    plugins: [
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      require('@babel/plugin-syntax-object-rest-spread'),
      require('@babel/plugin-syntax-async-generators'),
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-transform-modules-commonjs')
    ],
  };
}
