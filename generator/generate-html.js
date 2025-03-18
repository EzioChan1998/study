const path = require('path');
const fs = require('fs');

const templatePath = path.resolve(__dirname, './template-index.html');
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

let addContent = '';
files.forEach((file) => {
  const filePath = path.join(folderPath, file);
  const stats = fs.statSync(filePath);
  if (!stats) {
    console.error(`读取 ${file} 文件状态时出错:`);
    return;
  }

  if (stats.isDirectory()) {
    const str =
      `<li>
      <a href="./src/${file}/${file}.html">
        ${file}
      </a>
    </li>
    `;
    addContent = `${addContent}${str}`;
  }
});

const contents = template.split(/\{\{TEMPLATE}}/);
const newContent = contents.join(addContent);

fs.writeFile('index.html', newContent, (err) => {
  if (err) {
    console.error('生成index.html时出错:', err);
    return;
  }
  console.log('生成index.html成功!');
});
