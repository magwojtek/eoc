const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = {
  mode: 'production',
  entry: ['babel-polyfill', './client/src/app/index.jsx'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'client', 'src'), 'node_modules'],
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-jsx-remove-data-test-id']
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['./client/src/app/styles']
              }
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader?limit=100000'
      },
      {
        test: /\.(png|jpg)$/,
        use: 'file-loader'
      },
      {
        test: /\.md$/,
        use: [{ loader: 'html-loader' }, { loader: 'markdown-loader' }]
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCssAssetsPlugin()
    ]
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: true }),
    new MiniCssExtractPlugin({
      filename: 'style.[hash].css'
    }),
    new HtmlWebpackPlugin({
      favicon: './client/public/favicon/favicon.ico',
      template: './client/public/index.html'
    }),
    new WebpackPwaManifest({
      background_color: '#ffffff',
      display: 'standalone',
      fingerprints: false,
      icons: [
        {
          sizes: '72x72',
          src: path.resolve('./client/public/favicon/android-chrome-72x72.png'),
          type: 'image/png'
        },
        {
          sizes: '16x16',
          src: path.resolve('./client/public/favicon/favicon-16x16.png'),
          type: 'image/png'
        },
        {
          sizes: '32x32',
          src: path.resolve('./client/public/favicon/favicon-32x32.png'),
          type: 'image/png'
        },
        {
          sizes: '150x150',
          src: path.resolve('./client/public/favicon/mstile-150x150.png'),
          type: 'image/png'
        },
        {
          ios: true,
          sizes: '72x72',
          src: path.resolve('./client/public/favicon/apple-touch-icon.png'),
          type: 'image/png'
        }
      ],
      name: 'End of coffee',
      short_name: 'EOC',
      theme_color: '#ffffff'
    })
  ]
};
