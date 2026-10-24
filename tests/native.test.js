const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const executable = path.resolve('native',
    process.platform === 'win32' ? 'keypilot-stats.exe' : 'keypilot-stats');

test('C++: empty, Unicode, no final newline and buffer boundaries', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'keypilot-'));
    try {
        const samples = [
            ['', { lines: 0, words: 0, alnum: 0, bytes: 0 }],
            ['Hello world\n42', { lines: 2, words: 3, alnum: 12, bytes: 14 }],
            ['Привет мир\n', { lines: 1, words: 2, alnum: 0, bytes: 20 }],
            ['a'.repeat(4097), { lines: 1, words: 1, alnum: 4097, bytes: 4097 }],
            ['a'.repeat(4095) + ' b\n', { lines: 1, words: 2, alnum: 4096, bytes: 4098 }]
        ];
        for (const [text, expected] of samples) {
            const file = path.join(directory, 'имя с пробелами.txt');
            fs.writeFileSync(file, text);
            const actual = JSON.parse(execFileSync(executable, [file], { encoding: 'utf8' }));
            assert.deepEqual(actual, expected);
        }
        assert.throws(() => execFileSync(executable, [path.join(directory, 'missing')], {
            stdio: 'pipe'
        }));
        assert.throws(() => execFileSync(executable, [], { stdio: 'pipe' }));
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
