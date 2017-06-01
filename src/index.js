var fs = require('fs');
var mustache = require('mustache');
var path = require('path');


export default function () {
    return {
        noColors: true,
        
        reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.write(`Running tests in: ${userAgents}`)
                .newline()
                .newline();
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, errs) {
            const hasErr = !!errs.length;
            const result = hasErr ? `passed` : `failed`;

            name = `${this.currentFixtureName} - ${name}`;

            const title = `${result} ${name}`;

            this.write(title)
                .newline();
        },

        reportTaskDone (endTime, passed) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment
                                    .duration(durationMs)
                                    .format('h[h] mm[m] ss[s]');
            let footer = passed === this.testCount ?
                        `${this.testCount} passed` :
                        `${this.testCount - passed}/${this.testCount} failed`;

            footer += ` (Duration: ${durationStr})`;

            this.write(footer)
                .newline();

            var templateStr = fs.readFileSync(path.join(__dirname, '../src/index.html')).toString();
            var imagePath = 'img/';
            var result = [];


            if (fs.existsSync(imagePath)) {
                fs.readdirSync(imagePath)
                    .filter(fixtureDir =>{
                        return fs.lstatSync(path.join(imagePath, fixtureDir)).isDirectory();
                    })
                    .forEach(fixture => {
                        fs.readdirSync(path.join(imagePath, fixture))
                            .filter(testDir =>{
                                return fs.lstatSync(path.join(imagePath, fixture, testDir)).isDirectory();
                            })
                            .forEach(test => {
                                var testDirectory = path.join(imagePath, fixture, test);
                                var ethalonPath = path.join(testDirectory, 'ethalon/');
                                var currentPath = path.join(testDirectory, 'current/');

                                var currentFolders = fs.readdirSync(currentPath);
                                var lastTestFolder = path.join(currentPath, currentFolders[currentFolders.length - 1]);//last dir in current

                                fs.readdirSync(lastTestFolder)
                                    .forEach(screenShotName => {
                                        var img = path.join(lastTestFolder, screenShotName, 'chrome.png');
                                        var diff = path.join(lastTestFolder, screenShotName, 'chrome_diff.png');
                                        var ethImg = path.join(ethalonPath, screenShotName, 'chrome.png');

                                        var forCase = {
                                            current: img,
                                            diff:    diff,
                                            ethalon: ethImg
                                        };

                                        result.push(forCase);
                                    });
                            });
                    });
            }

            fs.writeFileSync('report.html', mustache.render(templateStr, { items: result }));
        }
    };
}
