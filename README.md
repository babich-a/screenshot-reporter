# testcafe-reporter-screenshot-reporter
[![Build Status](https://travis-ci.org/babich-a/testcafe-reporter-screenshot-reporter.svg)](https://travis-ci.org/babich-a/testcafe-reporter-screenshot-reporter)

This is the **screenshot-reporter** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/babich-a/testcafe-reporter-screenshot-reporter/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install testcafe-reporter-screenshot-reporter
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter screenshot-reporter
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('screenshot-reporter') // <-
    .run();
```

## Author
babich-a 
