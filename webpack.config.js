const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    
    // Multiple entry points for code splitting
    entry: {
      // Core functionality loaded on every page
      core: './src/js/core.js',
      
      // Feature-specific bundles loaded on-demand
      onboarding: './src/js/onboarding/index.js',
      collaborative: './src/js/collaborative/index.js',
      analytics: './src/js/analytics/index.js',
      personalization: './src/js/personalization/index.js',
      interactive: './src/js/interactive/index.js',
      assessment: './src/js/assessment/index.js',
      mockInterview: './src/js/mock-interview/index.js',
      
      // Page-specific bundles
      home: './src/js/pages/home.js',
      practice: './src/js/pages/practice.js',
      systemDesign: './src/js/pages/system-design.js',
      behavioral: './src/js/pages/behavioral.js',
      
      // Vendor libraries
      vendor: ['chart.js', 'mermaid', 'monaco-editor']
    },
    
    output: {
      path: path.resolve(__dirname, 'docs/assets/js'),
      filename: isProduction ? '[name].[contenthash:8].min.js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
      clean: true,
      publicPath: '/assets/js/'
    },
    
    // Advanced code splitting
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Core vendor libraries used across the site
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'initial',
            enforce: true
          },
          
          // Common utilities shared across modules
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
            enforce: true
          },
          
          // Heavy feature modules
          onboarding: {
            test: /onboarding/,
            name: 'onboarding-chunk',
            priority: 20,
            chunks: 'all'
          },
          
          collaborative: {
            test: /collaborative/,
            name: 'collaborative-chunk',
            priority: 20,
            chunks: 'all'
          },
          
          analytics: {
            test: /analytics/,
            name: 'analytics-chunk',
            priority: 20,
            chunks: 'all'
          },
          
          // CSS extraction
          styles: {
            name: 'styles',
            test: /\\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      },
      
      minimize: isProduction,
      minimizer: [
        // JavaScript optimization
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.warn'] : [],
              reduce_vars: true,
              reduce_funcs: true,
              hoist_funs: true,
              hoist_vars: true,
              if_return: true,
              join_vars: true,
              cascade: true,
              collapse_vars: true,
              comparisons: true,
              conditionals: true,
              dead_code: true,
              drop_unreachable: true,
              evaluate: true,
              loops: true,
              unused: true
            },
            mangle: {
              safari10: true,
              reserved: ['$', 'exports', 'require']
            },
            format: {
              comments: false,
              safari10: true
            }
          },
          extractComments: false,
          parallel: true
        }),
        
        // CSS optimization
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                colormin: true,
                convertValues: true,
                discardDuplicates: true,
                discardEmpty: true,
                mergeRules: true,
                minifyFontValues: true,
                minifyGradients: true,
                minifyParams: true,
                minifySelectors: true,
                reduceIdents: false, // Keep for Material Design classes
                svgo: true
              }
            ]
          }
        })
      ]
    },
    
    module: {
      rules: [
        // JavaScript/TypeScript processing
        {
          test: /\\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  },
                  modules: false,
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-transform-runtime'
              ]
            }
          }
        },
        
        // CSS processing
        {
          test: /\\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: !isProduction
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'autoprefixer',
                    'cssnano'
                  ]
                }
              }
            }
          ]
        },
        
        // Asset processing
        {
          test: /\\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: '../images/[name].[hash:8][ext]'
          }
        },
        
        {
          test: /\\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: '../fonts/[name].[hash:8][ext]'
          }
        }
      ]
    },
    
    plugins: [
      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: isProduction ? '../css/[name].[contenthash:8].min.css' : '../css/[name].css',
        chunkFilename: isProduction ? '../css/[id].[contenthash:8].css' : '../css/[id].css'
      }),
      
      // Compression for production
      ...(isProduction ? [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),
        
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
          filename: '[path][base].br'
        })
      ] : []),
      
      // Bundle analyzer (optional)
      ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
    ],
    
    // Enhanced resolve configuration
    resolve: {
      extensions: ['.js', '.mjs', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@js': path.resolve(__dirname, 'src/js'),
        '@css': path.resolve(__dirname, 'src/css'),
        '@utils': path.resolve(__dirname, 'src/js/utils'),
        '@components': path.resolve(__dirname, 'src/js/components')
      }
    },
    
    // Performance budgets and hints
    performance: {
      maxAssetSize: 250000, // 250KB per asset
      maxEntrypointSize: 400000, // 400KB per entry point
      hints: isProduction ? 'warning' : false,
      assetFilter: function(assetFilename) {
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      }
    },
    
    // Development server configuration
    devServer: {
      contentBase: path.join(__dirname, 'docs'),
      compress: true,
      port: 8080,
      hot: true,
      open: false
    },
    
    // Source maps for debugging
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Caching for faster builds
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.webpack-cache')
    },
    
    // Experimental features
    experiments: {
      topLevelAwait: true,
      asyncWebAssembly: true
    }
  };
};