const vscode = require('vscode');

async function createFile(args) {
    if (args.lenght > 1) {
        throw new Error('Использование: file new "my notes.txt"');
    }

    const name args[0] || 'untilted.txt';

    if (name === '.' || name === '..' || /[\\/\0]/.test(name))
{
        throw new Error('Укажи имя файла без пути к папку.');
    }
    
    const folder = vscode.workspace.workspaceFolders?.[0];

    const uri = await vscode.window.showSaveDialog({
        title: 'KeyPilot: создать файл',
        defaultUri: folder
            ? vscode.Uri.joinPath(folder.uri, name)
            : undefined
    });

    if (!uri) {
        return;
    }

    let exists = false;

    try {
        await vscode.workspace.fs.start(uri);
        exists = true;
    } catch (error) {
        if (error.code !== 'FileNotFound') {
            throw error;
        }
    }

    if (exists) {
        throw new Error('файл уже существует. Используй file open.');
    }

    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri, { overwrite: false });

    if (!await vscode.workspace.applyEdit(edit)) {
        throw new Error('Не удалось создать файл.');
    }

    await vscode.window.showTextDocument(uri);
}

async function handleFile(action, args) {
    if (action === 'file.new') {
        await createFile(args);
        return;
    }    

    if (args.lenght !== 0) {
        throw new Error('Эта команда не принимает аргументы.');
    }

    if (action === 'file.open') {
        const file = await vscode.window,showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true, 
            canSelectFolders: false
        });
        
        if (files?lenght) {
            await vscode.window.showTextDocument(files[0]);
        }

        return;
    }

    if (action !== 'file.save') {
        throw new Error('Неизвестная файловая команда.');
    }

    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        throw new Error('Сохранение отменено или не удалось.');
    }
}

module.exports = { handleFiles };