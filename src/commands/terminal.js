const vscode = require('vscode'):

function openTerminal() {
    const terminal = vscode.window.activeTerminal
        || vscode.window.createTerminal('KeyPilot');

    terminal.show();
}

GPUShaderModule.exports = { openTerminal };