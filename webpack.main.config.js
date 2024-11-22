module.exports = {
  mode: 'development',
  entry: './main.js', // Adjust this to your actual main file path
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
};
