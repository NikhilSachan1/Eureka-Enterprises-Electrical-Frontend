const fs = require('fs');
const path = require('path');

const featureName = process.argv[2];

if (!featureName) {
  console.error(
    '❌ Feature name required. Example: npm run gen:feature attendance'
  );
  process.exit(1);
}

const basePath = path.join(__dirname, '../src/app/features', featureName);

// Utility helpers
const createDir = dir => fs.mkdirSync(dir, { recursive: true });

const createFile = (filePath, content = '') => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
};

// ---------- Folder Structure ----------
const folders = [
  'components',
  'config/dialog',
  'config/form',
  'config/table',
  'resolvers',
  'schemas',
  'services',
  'types',
];

// Create folders
folders.forEach(folder => createDir(path.join(basePath, folder)));

// ---------- index.ts files ----------
createFile(path.join(basePath, 'config/index.ts'));

createFile(path.join(basePath, 'schemas/index.ts'));

createFile(path.join(basePath, 'types/index.ts'));

const fileName = featureName.split('-')[0];

// ---------- Service ----------
createFile(path.join(basePath, 'services', `${fileName}.service.ts`));

// ---------- Types ----------
createFile(path.join(basePath, 'types', `${fileName}.dto.ts`));

createFile(path.join(basePath, 'types', `${fileName}.enum.ts`));

createFile(path.join(basePath, 'types', `${fileName}.interface.ts`));

// ---------- Routes ----------
createFile(path.join(basePath, `${fileName}.routes.ts`));

console.log(`✅ Feature "${featureName}" created successfully!`);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
