const vscode = require('vscode');

/** Создаёт файл через диалог, не перезаписывая существующий. */
async function createFile(args) {
    if (args.length > 1) {
        throw new Error('Использование: file new "my notes.txt"');
    }
    const name = args[0] || 'untitled.txt';
    if (name === '.' || name === '..' || /[\\/\0]/.test(name)) {
        throw new Error('Укажи имя файла без пути к папке.');
    }
    const folder = vscode.workspace.workspaceFolders?.[0];
    const uri = await vscode.window.showSaveDialog({
        title: 'KeyPilot: создать файл',
        defaultUri: folder ? vscode.Uri.joinPath(folder.uri, name) : undefined
    });
    if (!uri) {
        return;
    }
    let exists = false;
    try {
        await vscode.workspace.fs.stat(uri);
        exists = true;
    } catch (error) {
        if (error.code !== 'FileNotFound') {
            throw error;
        }
    }
    if (exists) {
        throw new Error('Файл уже существует. Используй file open.');
    }
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri, { overwrite: false });
    if (!await vscode.workspace.applyEdit(edit)) {
        throw new Error('Не удалось создать файл.');
    }
    await vscode.window.showTextDocument(uri);
}

/** Выполняет создание, открытие или сохранение файла. */
async function handleFile(action, args) {
    if (action === 'file.new') {
        await createFile(args);
        return;
    }
    if (args.length !== 0) {
        throw new Error('Эта команда не принимает аргументы.');
    }
    if (action === 'file.open') {
        const files = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false
        });
        if (files?.length) {
            await vscode.window.showTextDocument(files[0]);
        }
        return;
    }
    if (action !== 'file.save') {
        throw new Error('Неизвестная файловая команда.');
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Сначала открой файл.');
    }
    if (!await editor.document.save()) {
        throw new Error('Сохранение отменено или не удалось.');
    }
}

module.exports = { handleFile };
