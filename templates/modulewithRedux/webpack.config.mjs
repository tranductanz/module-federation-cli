import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import * as Repack from '@callstack-mwg/repack';
import { deps } from './shared/dependencies.mjs';

export default (env) => {
    const {
        mode = 'development',
        context = Repack.getDirname(import.meta.url),
        entry = './index.js',
        platform = process.env.PLATFORM,
        minimize = mode === 'production',
        devServer = undefined,
        bundleFilename = undefined,
        sourceMapFilename = undefined,
        assetsPath = undefined,
        reactNativePath = new URL(
            './node_modules/react-native',
            import.meta.url
        ).pathname
    } = env;
    const dirname = Repack.getDirname(import.meta.url);

    if (!platform) {
        throw new Error('Missing platform');
    }
    if (devServer) {
        devServer.hmr = false;
    }
    process.env.BABEL_ENV = mode;
    const date = new Date();

    return {
        mode,
        devtool: false,
        context,
        entry: [
            ...Repack.getInitializationEntries(reactNativePath, {
                hmr: devServer && devServer.hmr
            }),
            entry
        ],
        resolve: {
            ...Repack.getResolveOptions(platform),
            alias: {
                '@constants': path.resolve(dirname, './src/constants/index'),
                '@components': path.resolve(dirname, './src/components/index')
            }
        },
        output: {
            clean: true,
            path: path.join(`${dirname}/build`, 'PackageBundle'),
            chunkFilename: '[name].chunk.bundle',
            publicPath: Repack.getPublicPath({ platform, devServer })
        },

        optimization: {
            minimize,
            minimizer: [
                new TerserPlugin({
                    test: /\.(js)?bundle(\?.*)?$/i,
                    extractComments: false,
                    terserOptions: {
                        format: {
                            comments: false
                        }
                    }
                })
            ],
            chunkIds: 'named'
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    include: [
                        /node_modules(.*[/\\])+react/,
                        /node_modules(.*[/\\])+@native-html/,
                        /node_modules(.*[/\\])+@react-native/,
                        /node_modules(.*[/\\])+@react-navigation/,
                        /node_modules(.*[/\\])+@react-native-community/,
                        /node_modules(.*[/\\])+@expo/,
                        /node_modules(.*[/\\])+pretty-format/,
                        /node_modules(.*[/\\])+metro/,
                        /node_modules(.*[/\\])+abort-controller/,
                        /node_modules(.*[/\\])+@callstack-mwg\/repack/,
                        /node_modules(.*[/\\])+react-native-blob-util/,
                        /node_modules(.*[/\\])+@rneui\/base/,
                        /node_modules(.*[/\\])+@rneui\/themed/,
                        /node_modules(.*[/\\])+mwg-kits\/core/
                    ],
                    use: 'babel-loader'
                },
                {
                    test: /\.tsx?$/,
                    include: [
                        /node_modules(.*[/\\])+@mwg-sdk/,
                        /node_modules(.*[/\\])+"@rneui\/base/,
                        /node_modules(.*[/\\])+@mwg-kits/
                    ],
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: 'babel-loader'
                },
                {
                    test: /\.js?$/,
                    use: 'babel-loader'
                },
                {
                    test: /\.d.ts?$/,
                    use: 'babel-loader'
                },
                {
                    test: /\.tsx?$/,
                    include: [
                        /node_modules(.*[/\\])+@mwg-sdk/,
                        /node_modules(.*[/\\])+"@rneui\/base/,
                        /node_modules(.*[/\\])+@mwg-kits/
                    ],
                    use: 'babel-loader'
                },
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins:
                                devServer && devServer.hmr
                                    ? ['module:react-refresh/babel']
                                    : undefined
                        }
                    }
                },
                {
                    test: Repack.getAssetExtensionsRegExp(
                        Repack.ASSET_EXTENSIONS.filter(
                            (ext) => ext !== 'svg' && ext !== 'ico'
                        )
                    ),
                    use: {
                        loader: '@callstack-mwg/repack/assets-loader',
                        options: {
                            platform,
                            devServerEnabled: Boolean(devServer),
                            scalableAssetExtensions: Repack.SCALABLE_ASSETS,
                            inline: true
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                native: true,
                                dimensions: false
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            new Repack.RepackPlugin({
                sourceMaps: mode === 'development',
                context,
                mode,
                platform,
                devServer,
                output: {
                    bundleFilename,
                    sourceMapFilename,
                    assetsPath
                }
            }),
            new Repack.plugins.ModuleFederationPlugin({
                name: 'TrackingOrder',
                exposes: {
                    './TrackingOrder': './src/App.js'
                },
                shared: deps
            })
        ]
    };
};
