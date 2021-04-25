const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production'

const frontend = {
  entry: {
      app: ['./src/web/App.tsx'],
  },
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '/',
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
        }
      },
      {
        test: /\.(png|jpg|gif|ttf)$/,
        loader: 'file-loader',
        options: {
          name: '[name]-[contenthash].[ext]'
        }
      },
      {
        test: [/\.svg$/],
        loader: 'raw-loader'
      },
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".jsx"],

    alias: {
    }
  },
  performance: {
    hints: false
  },

  mode: devMode ? 'development' : 'production',
  devtool: 'source-map',

  optimization: {
    splitChunks: {
      cacheGroups: {
        // split into groups for smaller incremental updates
        // thirdparty & our code will be placed into separate js files
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|reactstrap|mobx)[\\/]/,
          name: "react",
          priority: -8,
          chunks: "all"
        },
        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: "lodash",
          priority: -8,
          chunks: "all"
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: -10,
          enforce: true,
          chunks: "all"
        },
       default: {
           minChunks: 2,
           priority: -20,
           reuseExistingChunk: true
       }

      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/web/index.html',
      favicon: 'assets/favicon.ico',
    }),
    new webpack.ProvidePlugin({
    }),
  ]
}

if (!devMode) {
  frontend.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name]-[contenthash].css",
      chunkFilename: "[id].css"
    })
  );
}

module.exports = [
  frontend
]
