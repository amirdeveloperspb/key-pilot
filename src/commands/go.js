const vscode = require('vscode');

/** Проверяет номер строки и возвращает индекс с нуля. */
function parseLine(value, lineCount) {
    if (!/^[1-9]\d*$/.test(value || '')) {
        throw new Error('Нужен положительный целый номер строки.');
    }
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number > lineCount) {
        throw new Error('В файле всего строк: ' + lineCount);
    }
    return number - 1;
}

/** Перемещает курсор к началу указанной строки. */
function goToLine(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Сначала открой файл.');
    }
    if (args.length !== 1) {
        throw new Error('Использование: go 15');
    }
    const line = parseLine(args[0], editor.document.lineCount);
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
    );
}

module.exports = { goToLine, parseLine };
