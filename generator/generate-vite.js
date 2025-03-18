const path = require('path');
const fs = require('fs');

const templatePath = path.resolve(__dirname, './template.config.txt');
const template = fs.readFileSync(templatePath, 'utf8') || '';

if (!template) {
  console.error('读取模板文件时出错');
  return;
}

const folderPath = path.resolve(__dirname, '../src');
const files = fs.readdirSync(folderPath);
if (!files) {
  console.error('读取资源文件夹时出错');
  return;
}

let addContent = '\n';
files.forEach((file) => {
  const filePath = path.join(folderPath, file);
  const stats = fs.statSync(filePath);
  if (!stats) {
    console.error(`读取 ${file} 文件状态时出错:`);
    return;
  }

  if (stats.isDirectory()) {
    const str = `       '${file}': path.resolve(__dirname, './src/${file}/${file}.html'),\n`;
    addContent = `${addContent}${str}`;
  }
});

const contents = template.split(/\{\{%TEMPLATE%}}/);
const newContent = contents.join(addContent);

fs.writeFile('vite.config.ts', newContent, (err) => {
  if (err) {
    console.error('生成vite.config.ts时出错:', err);
    return;
  }
  console.log('生成vite.config.ts成功!');
});
