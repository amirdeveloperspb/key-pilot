const vscode = require('vscode');
const { parseLine } = require('./go');

/** Выделяет диапазон строк включительно. */
function selectLines(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Сначала открой файл.');
    }
    if (args.length !== 2) {
        throw new Error('Использование: select 5 10');
    }
    const count = editor.document.lineCount;
    const first = parseLine(args[0], count);
    const last = parseLine(args[1], count);
    if (first > last) {
        throw new Error('Начальная строка больше конечной.');
    }
    const start = new vscode.Position(first, 0);
    const end = last + 1 < count
        ? new vscode.Position(last + 1, 0)
        : editor.document.lineAt(last).range.end;
    editor.selection = new vscode.Selection(start, end);
    editor.revealRange(new vscode.Range(start, end));
}

module.exports = { selectLines };
