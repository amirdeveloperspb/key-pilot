const assert = require('node:assert/strict');
const test = require('node:test');
const Module = require('node:module');
const { parseCommand, getCommandList } = require('../src/parser');
const { createHistory } = require('../src/history');

// Минимальная замена VS Code API для проверки обработчиков вне редактора.
const api = {
    window: {},
    workspace: { fs: {} },
    TextEditorRevealType: { InCenter: 0 },
    Position: class { constructor(line, character) { Object.assign(this, { line, character }); } },
    Selection: class { constructor(start, end) { Object.assign(this, { start, end }); } },
    Range: class { constructor(start, end) { Object.assign(this, { start, end }); } },
    WorkspaceEdit: class { createFile(uri, options) { Object.assign(this, { uri, options }); } },
    Uri: { joinPath: (base, name) => base + '/' + name }
};
const originalLoad = Module._load;
Module._load = function (name, ...args) {
    return name === 'vscode' ? api : originalLoad.call(this, name, ...args);
};
const { goToLine } = require('../src/commands/go');
const { selectLines } = require('../src/commands/select');
const { handleFile } = require('../src/commands/file');
const { openTerminal } = require('../src/commands/terminal');
const { openCommandBar } = require('../src/commandBar');
Module._load = originalLoad;

test('parser: hierarchy, quoted names and invalid commands', () => {
    assert.deepEqual(parseCommand('file new "my notes.txt"'), {
        action: 'file.new', args: ['my notes.txt']
    });
    assert.deepEqual(parseCommand(' go   15 '), { action: 'go', args: ['15'] });
    assert.equal(parseCommand('mode navigate').action, 'mode.navigate');
    for (const input of ['', 'file', 'file delete', 'unknown', 'file new "x']) {
        assert.throws(() => parseCommand(input));
    }
    assert.equal(getCommandList().length, 10);
});

test('history: persistence, deduplication and 30-item limit', async () => {
    let saved = [];
    const context = { workspaceState: {
        get: () => saved,
        update: async (key, value) => { saved = [...value]; }
    } };
    const history = createHistory(context);
    for (let i = 0; i < 35; i++) await history.add('go ' + (i + 1));
    await history.add('go 10');
    assert.equal(history.list().length, 30);
    assert.equal(history.list()[0], 'go 10');
    assert.equal(history.list().filter(x => x === 'go 10').length, 1);
    assert.deepEqual(createHistory(context).list(), history.list());
});

test('go/select: positions, last line and invalid arguments', () => {
    const editor = { document: {
        lineCount: 3,
        lineAt: line => ({ range: { end: new api.Position(line, 4) } })
    }, revealRange() {} };
    api.window.activeTextEditor = editor;
    goToLine(['2']);
    assert.equal(editor.selection.start.line, 1);
    for (const args of [[], ['0'], ['abc'], ['4'], ['1', '2']]) {
        assert.throws(() => goToLine(args));
    }
    selectLines(['1', '2']);
    assert.equal(editor.selection.end.line, 2);
    assert.equal(editor.selection.end.character, 0);
    selectLines(['3', '3']);
    assert.equal(editor.selection.end.character, 4);
    assert.throws(() => selectLines(['2', '1']));
    assert.throws(() => selectLines(['1']));
    api.window.activeTextEditor = undefined;
    assert.throws(() => goToLine(['1']));
});

test('file: creation, overwrite protection, opening and saving', async () => {
    const shown = [];
    api.window.showSaveDialog = async () => '/test/new.txt';
    api.window.showTextDocument = async uri => shown.push(uri);
    api.workspace.fs.stat = async () => { throw { code: 'FileNotFound' }; };
    api.workspace.applyEdit = async edit => {
        assert.equal(edit.options.overwrite, false);
        return true;
    };
    await handleFile('file.new', ['new.txt']);
    assert.equal(shown.pop(), '/test/new.txt');
    api.workspace.fs.stat = async () => ({});
    await assert.rejects(handleFile('file.new', ['new.txt']), /существует/);
    await assert.rejects(handleFile('file.new', ['../bad']));
    await assert.rejects(handleFile('file.open', ['extra']));
    api.window.showOpenDialog = async () => ['/test/open.txt'];
    await handleFile('file.open', []);
    assert.equal(shown.pop(), '/test/open.txt');
    let saved = false;
    api.window.activeTextEditor = { document: {
        save: async () => { saved = true; return true; }
    } };
    await handleFile('file.save', []);
    assert.equal(saved, true);
    api.window.activeTextEditor.document.save = async () => false;
    await assert.rejects(handleFile('file.save', []));
});

test('terminal: create once and reuse active terminal', () => {
    let created = 0;
    let shown = 0;
    api.window.activeTerminal = undefined;
    api.window.createTerminal = () => {
        created++;
        return { show: () => shown++ };
    };
    openTerminal();
    api.window.activeTerminal = { show: () => shown++ };
    openTerminal();
    assert.equal(created, 1);
    assert.equal(shown, 2);
});

test('command bar: suggestions, execution and error reporting', async () => {
    let accept;
    let refresh;
    let error;
    const picker = {
        value: '', items: [], selectedItems: [],
        onDidChangeValue(fn) { refresh = fn; return { dispose() {} }; },
        onDidAccept(fn) { accept = fn; return { dispose() {} }; },
        onDidHide() {}, show() {}, hide() {}
    };
    api.window.createQuickPick = () => picker;
    api.window.showErrorMessage = message => { error = message; };
    const added = [];
    openCommandBar({ history: { list: () => [], add: async text => added.push(text) } });
    assert.equal(picker.items.length, 10);
    picker.value = 'file';
    refresh();
    assert.equal(picker.items.length, 4);
    picker.value = 'terminal';
    refresh();
    picker.selectedItems = [picker.items[0]];
    await accept();
    assert.deepEqual(added, ['terminal']);
    picker.value = 'unknown';
    refresh();
    picker.selectedItems = [picker.items[0]];
    await accept();
    assert.match(error, /KeyPilot:/);
    assert.equal(added.length, 1);
});
