const path = require('path')
const paths = require('react-scripts/config/paths')
paths.appBuild = path.join(path.dirname(path.dirname(paths.appBuild)), '/src/templates')