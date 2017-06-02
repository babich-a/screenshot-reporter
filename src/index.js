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

            var templateStr = fs.readFileSync(path.join(__dirname, '../lib/index.html')).toString();
            var imagePath = 'img/';
            var result = [];
            var fixtureName = '';

            if (fs.existsSync(imagePath)) {
                fs.readdirSync(imagePath)
                    .filter(fixtureDir =>{
                        return fs.lstatSync(path.join(imagePath, fixtureDir)).isDirectory() && fixtureDir !== 'thumbnails';
                    })
                    .forEach(fixture => {
                        fixtureName = fixture;
                        fs.readdirSync(path.join(imagePath, fixture))
                            .filter(testDir =>{
                                return fs.lstatSync(path.join(imagePath, fixture, testDir)).isDirectory() && testDir !== 'thumbnails';
                            })
                            .forEach(test => {
                                var testDirectory = path.join(imagePath, fixture, test);
                                var etalonPath = path.join(testDirectory, 'etalon/');
                                var currentPath = path.join(testDirectory, 'current/');

                                if (fs.existsSync(currentPath)) {
                                    var currentFolders = fs.readdirSync(currentPath);
                                    var lastTestFolder = path.join(currentPath, currentFolders[currentFolders.length - 1]);//last dir in current

                                    fs.readdirSync(lastTestFolder)
                                        .forEach(screenShotName => {
                                            var img = path.join(lastTestFolder, screenShotName, 'chrome.png');
                                            var diff = path.join(lastTestFolder, screenShotName, 'chrome_diff.png');
                                            var ethImg = path.join(etalonPath, screenShotName, 'chrome.png');
                                            var failed = fs.existsSync(diff);

                                            var forCase = {
                                                current: img,
                                                diff:    diff,
                                                etalon:  ethImg,
                                                failed:  failed ? 'failed' : '',
                                                name:    screenShotName
                                            };

                                            result.push(forCase);
                                        });
                                }

                                
                            });
                    });
            }

            fs.writeFileSync('report.html', mustache.render(templateStr, { fixture: fixtureName, items: result }));
            console.log('Report path: ' + path.resolve('report.html'));
        }
    };
}
