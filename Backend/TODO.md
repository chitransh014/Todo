# TODO: Fix Jest ESM Parsing Issue

## Steps to Complete

- [x] Add Babel dependencies (`@babel/core`, `@babel/preset-env`, `babel-jest`) to `Backend/package.json` devDependencies
- [x] Create `babel.config.js` in Backend directory with preset-env configuration
- [x] Update `Backend/jest.config.js` to add transform for `.js` files and remove ts-jest globals
- [x] Run `npm install` in Backend directory to install new dependencies
- [x] Run `npm test -- --testPathPattern=tasks.test.js` to verify the test passes
