const vscode = require('vscode');

const { openCommandBar} = require('./commandBar');

function activate(context) {
    const command = vscode.commands.registerCommand(
        'keyPilot.open',
        openCommandBar
    );

    context.subscriptions.push(command);
}

module.exports = { activate };