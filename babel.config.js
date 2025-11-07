module.exports = function (api) {
  api.cache(true);
  return {
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
