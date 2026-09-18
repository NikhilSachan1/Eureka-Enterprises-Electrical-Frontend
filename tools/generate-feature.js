'use strict';

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.error(`Usage:
  npm run gen:feature <feature-name>
  npm run gen:feature <parent-under-features> <feature-name>

Examples:
  npm run gen:feature widget-management
  npm run gen:feature leave-management foo
  npm run gen:feature site-management/doc-management payment-advice`);
}

function kebabToPascal(kebab) {
  return kebab
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function kebabToConst(kebab) {
  return kebab
    .split('-')
    .filter(Boolean)
    .map(part => part.toUpperCase())
    .join('_');
}

function toFileSlug(featureName) {
  return featureName.replace(/-management$/, '');
}

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value);
}

function createDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function createFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false;
  }
  fs.writeFileSync(filePath, content);
  return true;
}

const args = process.argv.slice(2).filter(arg => arg && !arg.startsWith('-'));

if (args.length === 0 || args.length > 2) {
  printUsage();
  process.exit(1);
}

const featuresRoot = path.resolve(__dirname, '../src/app/features');
const parentRel = args.length === 2 ? args[0].replace(/\\/g, '/') : '';
const featureName = args.length === 2 ? args[1] : args[0];

if (!isKebabCase(featureName)) {
  console.error(
    '❌ Feature name must be kebab-case (e.g. leave-management, foo).'
  );
  process.exit(1);
}

if (parentRel) {
  const parentParts = parentRel.split('/').filter(Boolean);
  if (
    parentParts.length === 0 ||
    parentParts.some(part => part === '..' || !isKebabCase(part))
  ) {
    console.error(
      '❌ Parent path must be kebab-case segments under src/app/features (e.g. leave-management or site-management/doc-management).'
    );
    process.exit(1);
  }
}

const basePath = path.resolve(
  parentRel ? path.join(featuresRoot, parentRel, featureName) : path.join(featuresRoot, featureName)
);

if (
  basePath !== featuresRoot &&
  !basePath.startsWith(`${featuresRoot}${path.sep}`)
) {
  console.error('❌ Invalid path: must stay under src/app/features.');
  process.exit(1);
}

if (fs.existsSync(basePath) && fs.readdirSync(basePath).length > 0) {
  console.error(
    `❌ Folder already exists and is not empty: ${path.relative(process.cwd(), basePath)}`
  );
  process.exit(1);
}

const fileSlug = toFileSlug(featureName);
const className = kebabToPascal(fileSlug);
const routesConst = `${kebabToConst(featureName)}_ROUTES`;

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

folders.forEach(folder => createDir(path.join(basePath, folder)));

createFile(
  path.join(basePath, 'config/index.ts'),
  `// Export form, table, and dialog configs from this folder.
export {};
`
);

createFile(
  path.join(basePath, 'schemas/index.ts'),
  `// Export Zod request/response schemas from this folder.
export {};
`
);

createFile(
  path.join(basePath, 'types/index.ts'),
  `// Export DTOs, enums, and interfaces from this folder.
export {};
`
);

createFile(
  path.join(basePath, 'types', `${fileSlug}.dto.ts`),
  `// Add request/response DTOs here (usually z.infer from ../schemas).
export {};
`
);

createFile(
  path.join(basePath, 'types', `${fileSlug}.enum.ts`),
  `// Add feature enums here.
export {};
`
);

createFile(
  path.join(basePath, 'types', `${fileSlug}.interface.ts`),
  `// Add feature-only UI/view interfaces here.
export {};
`
);

createFile(
  path.join(basePath, 'services', `${fileSlug}.service.ts`),
  `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ${className}Service {}
`
);

createFile(
  path.join(basePath, `${fileSlug}.routes.ts`),
  `import { Routes } from '@angular/router';

export const ${routesConst}: Routes = [];
`
);

const relativePath = path.relative(process.cwd(), basePath).replace(/\\/g, '/');

console.log(`✅ Feature scaffold created at ${relativePath}`);
console.log(`
Next:
  1. Add API_ROUTES and APP_PERMISSION constants.
  2. Add ROUTES / ROUTE_BASE_PATHS if this is a new page.
  3. Add Zod schemas, then DTOs via z.infer.
  4. Add form/table configs and OnPush standalone components.
  5. Wire ${routesConst} into the parent *.routes.ts with loadChildren / loadComponent.
  6. Add a menu item in core/config/menu.config.ts when the page should appear in the sidebar.
`);
