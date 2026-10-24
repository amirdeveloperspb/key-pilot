const vscode = require('vscode');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const executeFile = promisify(execFile);

/** Запускает C++ программу и показывает статистику файла. */
async function showStats(context) {
    const document = vscode.window.activeTextEditor?.document;

    if (!document || document.uri.scheme !== 'file') {
        throw new Error('Открой файл, сохранённый на диске.');
    }

    if (document.isDirty) {
        const answer = await vscode.window.showWarningMessage(
            'Для подсчёта нужно сохранить изменения.',
            'Сохранить'
        );

        if (answer !== 'Сохранить') {
            return;
        }

        if (!await document.save()) {
            throw new Error('Не удалось сохранить файл.');
        }
    }

    const name = process.platform === 'win32'
        ? 'keypilot-stats.exe'
        : 'keypilot-stats';

    const executable = context.asAbsolutePath(
        path.join('native', name)
    );

    let stdout;

    try {
        const result = await executeFile(
            executable,
            [document.uri.fsPath],
            { timeout: 15000 }
        );

        stdout = result.stdout;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(
                'Собери C++ модуль: npm run build:native'
            );
        }

        throw new Error(
            error.stderr?.trim() || 'Ошибка запуска C++ модуля.'
        );
    }

    const stats = JSON.parse(stdout);

    for (const key of ['lines', 'words', 'alnum', 'bytes']) {
        if (
            !Number.isSafeInteger(stats[key]) ||
            stats[key] < 0
        ) {
            throw new Error('C++ модуль вернул некорректные данные.');
        }
    }

    vscode.window.showInformationMessage(
        `Строк: ${stats.lines} | Слов: ${stats.words} | ` +
        `Латинских букв и цифр: ${stats.alnum} | Байт: ${stats.bytes}`
    );
}

module.exports = { showStats };
