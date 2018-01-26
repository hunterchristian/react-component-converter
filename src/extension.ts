'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { buildStatefulComponent } from './helpers/componentBuilders';

const DEFAULT_PROPS_NAME = 'OwnProps';

const getRenderFunctionStartPos = (text: string): number => {
    const firstSearchPatternResult = text.indexOf('=> {');
    const secondSearchPatternResult = text.indexOf('=>{');
    const thirdSearchPatternResult = text.indexOf('=> (');
    const fourthSearchPatternResult = text.indexOf('=>(');

    if (firstSearchPatternResult !== -1) {
        return firstSearchPatternResult + 3;
    }
    if (secondSearchPatternResult !== -1) {
        return secondSearchPatternResult + 2;
    }
    if (thirdSearchPatternResult !== -1) {
        return thirdSearchPatternResult + 3;
    }
    if (fourthSearchPatternResult !== -1) {
        return fourthSearchPatternResult + 2;
    }
}

const getRenderFunctionEndPos = (text: string): number =>
    text.lastIndexOf('}') !== -1
        ? text.lastIndexOf('}')
        : text.lastIndexOf(')');

const getRenderFunction = (component: string): string => {
    const lines = component
        .substring(getRenderFunctionStartPos(component) + 1, getRenderFunctionEndPos(component))
        .trim()
        .split('\n');

    let formattedStr = '';
    for (let line of lines) {
        formattedStr += `\t${line}\n`;
    }

    return formattedStr;
}

const isFunctionalReactComponent = (component: string): boolean => {
    const componentLines = component.split('\n');
    const firstLine = componentLines[0];
    const lastLine = componentLines[componentLines.length - 1];

    const startPos = getRenderFunctionStartPos(component);
    const endPos = getRenderFunctionEndPos(lastLine);
    const lastLineHasBracket = getRenderFunctionEndPos(lastLine) > -1;

    return startPos > -1 &&
        endPos > -1 &&
        lastLineHasBracket;
}

const getPropsFromFunctionalComponent = (text: string): string | null => {
    const startPos = text.indexOf(': ') > -1 ? text.indexOf(': ') + 1 : text.indexOf(':');
    const endPos = text.indexOf(' )') > -1 ? text.indexOf(' )') + 1 : text.indexOf(')');

    return startPos !== -1 && endPos !== -1 && startPos < endPos
        ? text.substring(startPos, endPos).trim()
        : DEFAULT_PROPS_NAME;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "react-component-converter" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.convertComponent', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (isFunctionalReactComponent(text)) {
            vscode.window.showInputBox({ prompt: 'Enter a class name for the component' })
                .then((className: string) => {
                    // Safe to assume that props type is in the first line of highlighted text?
                    const propsType = getPropsFromFunctionalComponent(text.split('\n')[0]);
                    console.log(`PropsType: ${ propsType }`);

                    const renderFunction = getRenderFunction(text);
                    const statefulComponent = buildStatefulComponent(renderFunction, className, propsType);
                    console.log(statefulComponent);

                    editor.edit(editBuilder => editBuilder.replace(selection, statefulComponent));
                });
        } else {
            vscode.window.showInformationMessage('Selection not recognized as functional react component. Did you highlight the whole thing?');
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}