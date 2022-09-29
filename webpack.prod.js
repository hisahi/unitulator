const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

const config = merge(common, {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      }
    ],
  }
});

module.exports = () => {
  config.mode = "production";
  config.plugins.push(new MiniCssExtractPlugin());
  config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  return config;
};
