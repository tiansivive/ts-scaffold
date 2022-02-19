const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");

const publicPath = "/";
const srcPath = path.resolve(__dirname, "src");

module.exports = function (_, { mode }) {
  const isProduction = mode === "production";

  return {
    mode: "development",
    bail: isProduction, // Stop compilation early in production
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    entry: "./src/main.ts",
    stats: "minimal",
    output: {
      assetModuleFilename: "static/media/[name][hash:8][ext]",
      path: path.resolve(__dirname, "./build"),
      pathinfo: !isProduction,
      filename: "static/js/[name].[contenthash:8].js",
      chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
      publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isProduction
        ? info =>
            path
              .relative(srcPath, info.absoluteResourcePath)
              .replace(/\\/g, "/")
        : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
      globalObject: "this",
    },
    devServer: {
      historyApiFallback: {
        disableDotRule: true,
        index: "/",
      },
      hot: false,
      port: 8080,
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new ESBuildMinifyPlugin({
          target: "es2015",
          css: true,
        }),
      ],
      splitChunks: {
        chunks: "all",
      },
    },
    resolve: {
      modules: [
        "node_modules",
        // NOTE: This allows us to import non-typescript files with absolute urls (f ex "styles/fonts.scss"):
        path.resolve(__dirname, "./src"),
      ],
      extensions: [".js", ".ts", ".tsx"],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: [/\.(png|svg|woff2?)$/],
          type: "asset/resource",
        },
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: "esbuild-loader",
              options: {
                loader: "tsx",
                target: "es2015",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
      }),
      new CleanWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin(),
    ],
  };
};
