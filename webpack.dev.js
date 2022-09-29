const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

const config = merge(common, {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  }
});

module.exports = () => {
  config.mode = "development";
  config.devtool = "inline-source-map";
  config.devServer = { host: "localhost" };
  return config;
};
