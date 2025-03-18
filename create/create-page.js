const fs = require('fs');
const path = require("path");
const { exec} = require('child_process');

const args = process.argv;

if(args.length > 2) {
  const name = args[2];
  const folderPath = path.resolve(__dirname, `../src/${name}`);
  fs.mkdir(folderPath, err => {
    if(err) throw err;
    const templatePath = path.resolve(__dirname, './template.html');
    const HTMLTemplate = fs.readFileSync(templatePath, 'utf8') || '';
    const contents = HTMLTemplate.split(/\{\{pageName}}/);
    const newContent = contents.join(name);

    fs.writeFile(path.resolve(folderPath, `./${name}.html`), newContent, (err) => {
      if(err) throw err;

      fs.writeFile(path.resolve(folderPath, `./${name}.ts`), '', (err) => {
        if(err) throw err;

        exec('pnpm generate');
      });
    });

  });

} else {
  console.error("please insert page name");
}
