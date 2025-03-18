const fs = require('fs');
const path = require('path');
const { exec} = require('child_process');

const args = process.argv;

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath); // 递归删除子文件夹
      } else {
        fs.unlinkSync(curPath); // 删除文件
      }
    });
    fs.rmdirSync(folderPath); // 删除文件夹
    console.log(`成功删除文件夹：${folderPath}`);
  }
}

if(args.length > 2) {
  // 删除指定文件夹及其内部的文件
  const name = args[2];
  const folderPath = path.resolve(__dirname, `../src/${name}`); // 替换为实际的文件夹路径
  deleteFolderRecursive(folderPath);
  exec('pnpm generate');
} else {
  console.error("please insert page name");
}
