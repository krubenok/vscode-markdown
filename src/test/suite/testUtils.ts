import * as path from 'path'
import * as assert from 'assert';
import { commands, window, workspace, Position, Range, Selection } from 'vscode';

export let testMdFile = path.join(__dirname, '..', '..', '..', 'test', 'test.md');
export let defaultConfigs = {
    "mdx.extension.toc.levels": "1..6",
    "mdx.extension.toc.unorderedList.marker": "-",
    "mdx.extension.toc.orderedList": false,
    "mdx.extension.toc.plaintext": false,
    "mdx.extension.toc.updateOnSave": true,
    "mdx.extension.toc.githubCompatibility": false,
    "mdx.extension.toc.omittedFromToc": {},
    "mdx.extension.toc.downcaseLink": true,
    "mdx.extension.preview.autoShowPreviewToSide": false,
    "mdx.extension.orderedList.marker": "ordered",
    "mdx.extension.italic.indicator": "*",
    "mdx.extension.tableFormatter.normalizeIndentation": false,
    "editor.insertSpaces": true,
    "editor.tabSize": 4
}

// 💩 Promise, then, async/await ... <https://github.com/Microsoft/vscode/issues/31210>

export async function testCommand(command: string, configs, lines: string[], selection: Selection, expLines: string[], expSelection: Selection) {
    let tempConfigs = Object.assign({}, defaultConfigs);
    for (let key of Object.keys(configs)) {
        tempConfigs[key] = configs[key];
    }
    for (let key of Object.keys(tempConfigs)) {
        await workspace.getConfiguration().update(key, tempConfigs[key], true);
    }
    return workspace.openTextDocument(testMdFile).then(document => {
        return window.showTextDocument(document).then(editor => {
            return editor.edit(editBuilder => {
                let fullRange = new Range(new Position(0, 0), editor.document.positionAt(editor.document.getText().length));
                editBuilder.delete(fullRange);
                editBuilder.insert(new Position(0, 0), lines.join('\n'));
            }).then(b => {
                window.activeTextEditor.selection = selection;
                return commands.executeCommand(command).then(() => {
                    let actual = window.activeTextEditor.document.getText();
                    actual = actual.replace(/\r\n/g, '\n').replace(/\t/g, '    '); /* !!! */
                    assert.deepEqual(actual, expLines.join('\n').replace(/\t/g, '    '));
                    assert.deepEqual(window.activeTextEditor.selection, expSelection);
                });
            });
        });
    });
}
