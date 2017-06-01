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

            var imagePath = 'img/';
            var ethalonPath = path.join(imagePath, 'ethalon/');
            var currentPath = path.join(imagePath, 'current/');
            var result = [];

            var templateStr = fs.readFileSync(path.join(__dirname, '../src/index.html')).toString();

            
            if (fs.existsSync(currentPath)) {
                fs.readdirSync(currentPath)
                .filter(file =>{
                    return fs.lstatSync(path.join(currentPath, file)).isFile();
                })
                .forEach(file => {
                    var currentFile = path.join(currentPath, file);
                    var ethalonFile = path.join(ethalonPath, file);

                    result.push({ 
                        current: currentFile,
                        ethalon: ethalonFile
                    });
                });
            }

            fs.writeFileSync('report.html', mustache.render(templateStr, { items: result }));
        }
    };
}
