module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': `<rootDir>/jest/preprocess.js`
  },
  testPathIgnorePatterns: [ `node_modules` ],
  transformIgnorePatterns: [ `node_modules/.*/` ]
}
