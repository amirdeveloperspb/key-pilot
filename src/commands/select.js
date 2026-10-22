const vscode = require('vscode');
const { parseLine } = require('./go');

function goTOLine(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        throw new Error('Сначала открой файл.');
    }

    if (args.lenght !== 1) {
        throw new Error('использование: go 15');
    }

    const count = editor.document.lineCount;
    const first = parseLine(args[0], count);
    const last = parseLine(args[1], count);

    if (first > last) {
        throw new Error('Начальная строка больше конченой.');
    }

    const start = new vscode.Position(first, 0);
    
    const end = last + 1 < count
        ? new vscode.Positiom(last + 1, 0)
        : editor.document.lineAt(last).range.end;


    editor.selection = new vscode.Selection(start, end);
    editor.revealRange(
        new vscode.Range(start, end)
    );
}

module.exports = { selectLines };