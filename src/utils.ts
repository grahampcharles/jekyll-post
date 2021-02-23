import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export const postSnippet: string =
`---
layout: $\{1:post\}
title: $\{2\}
date: YYYY
category: $\{3\}
author: $\{4\}
tags: [$\{5\}]
summary: $\{6\}
---

$\{7\}`;

var insertFrontMatter: boolean = false;

export function
shouldInsertFrontMatter(): boolean {
  return insertFrontMatter;
}

export function
setFrontMatter(flag: boolean): void {
  insertFrontMatter = flag;
}

export async function
createFile(dirName: string, newFileName: string): Promise<string> {
  let folders = vscode.workspace.workspaceFolders;
  if (folders === undefined || dirName === null || dirName === undefined) {
    return newFileName;
  }
  const templateName = '.post-template';
  const templatePath = path.resolve(folders[0].uri.fsPath, templateName);
  const fileName = path.resolve(dirName, newFileName);
  const templateExists: boolean = templatePath !== undefined &&
                                  fs.existsSync(templatePath);
  const fileExists: boolean = fs.existsSync(fileName);
  const frontMatter = templateExists ? fs.readFileSync(templatePath) : '';
  setFrontMatter(!fileExists && !templateExists);
  if (!fileExists) {
    fs.appendFileSync(fileName, frontMatter);
  }
  return fileName;
}

export async function
openFile(fileName: string): Promise<vscode.TextEditor> {
  const stats = fs.statSync(fileName);

  if (stats.isDirectory()) {
    throw new Error("This file is a directory!");
  }

  const doc = await vscode.workspace.openTextDocument(fileName);
  if (!doc) {
    throw new Error('Could not open file!');
  }

  const editor = vscode.window.showTextDocument(doc);
  if (!editor) {
    throw new Error('Could not show document!');
  }
  return editor;
}

export async function
getPostTitleFromUser(): Promise<string> {
  const defaultPostTitle = "Untitled Post";
  let question = `What's the title of the new post?`;

  let postTitle = await vscode.window.showInputBox({
    prompt: question,
    value: defaultPostTitle,
  });
  if (postTitle === null || postTitle === undefined) {
    return defaultPostTitle;
  }
  return postTitle || defaultPostTitle;
}

export function
getDateTime(): string {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var time = String(today.getHours()).padStart(2, '0') +
             ":" +
             String(today.getMinutes()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd + ' ' + time;
}

// converts post name to legal file name in the form yyyy-mm-dd-post-name-here.md
export function
normalizeFilename(postName: string): string {
  if (postName === null) {
    throw undefined;
  }
  const legalFileName = postName.toLowerCase().replace(/ /g, '-').replace(/[/\\?%*:|"<>]/g, '-')
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}-${legalFileName}.md`
}
