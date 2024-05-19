let [editorConfig] = require('@spenserhale/gutenberg-blocks-components/configs/webpack.config');

editorConfig.entry = {
  'app': './react/entry.tsx',
};

editorConfig.externals = {
  'react': 'React',
  'react-dom': 'ReactDOM',
};

module.exports = editorConfig;
