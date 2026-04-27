const fs = require('fs');
const path = require('path');

/**
 * Script to find and optionally delete empty folders and files
 * Usage: node tools/find-empty-items.js [options]
 * Options:
 *   --delete     Delete empty items (default: false, just list them)
 *   --files      Check for empty files (default: true)
 *   --folders    Check for empty folders (default: true)
 *   --exclude    Comma-separated directories to exclude
 *   --output     Output file path (optional)
 *
 * Empty .scss (and .sass) files are ignored — they are not reported or deleted.
 */

class EmptyItemsFinder {
  constructor(options = {}) {
    this.rootPath = path.join(__dirname, '..');
    this.shouldDelete = options.delete || false;
    this.checkFiles = options.files !== false;
    this.checkFolders = options.folders !== false;
    this.excludeDirs = options.exclude
      ? options.exclude.split(',')
      : [
          'node_modules',
          'dist',
          '.git',
          '.angular',
          'coverage',
          '.vscode',
          '.idea',
          'tools',
        ];
    this.outputFile = options.output || null;

    this.emptyFiles = [];
    this.emptyFolders = [];
    this.deletedFiles = [];
    this.deletedFolders = [];
    this.errors = [];
  }

  /**
   * Check if directory should be excluded
   */
  shouldExclude(dirPath) {
    const relativePath = path.relative(this.rootPath, dirPath);
    return this.excludeDirs.some(
      excluded =>
        relativePath.includes(excluded) ||
        path.basename(dirPath).startsWith(excluded)
    );
  }

  /**
   * Skip empty-file checks for stylesheets that are often intentionally minimal.
   */
  shouldIgnoreEmptyFileCheck(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.scss' || ext === '.sass' || ext === '.html';
  }

  /**
   * Check if file is empty
   */
  isFileEmpty(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size === 0;
    } catch (error) {
      this.errors.push(`Error checking file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if folder is empty
   */
  isFolderEmpty(folderPath) {
    try {
      const items = fs.readdirSync(folderPath);

      // Filter out excluded items
      const validItems = items.filter(item => {
        const itemPath = path.join(folderPath, item);
        return !this.shouldExclude(itemPath);
      });

      return validItems.length === 0;
    } catch (error) {
      this.errors.push(`Error checking folder ${folderPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete empty file
   */
  deleteFile(filePath) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      this.errors.push(`Error deleting file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete empty folder
   */
  deleteFolder(folderPath) {
    try {
      fs.rmdirSync(folderPath);
      return true;
    } catch (error) {
      this.errors.push(`Error deleting folder ${folderPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Scan directory recursively
   */
  scanDirectory(dirPath) {
    if (this.shouldExclude(dirPath)) {
      return;
    }

    try {
      const items = fs.readdirSync(dirPath);

      // First, scan subdirectories
      for (const item of items) {
        const itemPath = path.join(dirPath, item);

        if (this.shouldExclude(itemPath)) {
          continue;
        }

        try {
          const stats = fs.statSync(itemPath);

          if (stats.isDirectory()) {
            // Recursively scan subdirectory first
            this.scanDirectory(itemPath);

            // Then check if it's empty (after scanning children)
            if (this.checkFolders && this.isFolderEmpty(itemPath)) {
              const relativePath = path.relative(this.rootPath, itemPath);
              this.emptyFolders.push(relativePath);

              if (this.shouldDelete) {
                if (this.deleteFolder(itemPath)) {
                  this.deletedFolders.push(relativePath);
                  console.log(`✅ Deleted empty folder: ${relativePath}`);
                }
              }
            }
          } else if (stats.isFile()) {
            // Check if file is empty (SCSS/Sass excluded)
            if (
              this.checkFiles &&
              !this.shouldIgnoreEmptyFileCheck(itemPath) &&
              this.isFileEmpty(itemPath)
            ) {
              const relativePath = path.relative(this.rootPath, itemPath);
              this.emptyFiles.push(relativePath);

              if (this.shouldDelete) {
                if (this.deleteFile(itemPath)) {
                  this.deletedFiles.push(relativePath);
                  console.log(`✅ Deleted empty file: ${relativePath}`);
                }
              }
            }
          }
        } catch (error) {
          // Skip files/directories that can't be accessed
          this.errors.push(`Cannot access ${itemPath}: ${error.message}`);
        }
      }
    } catch (error) {
      this.errors.push(`Error reading directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    let report = '';

    report += '='.repeat(80) + '\n';
    report += 'EMPTY FILES AND FOLDERS REPORT\n';
    report += '='.repeat(80) + '\n\n';
    report += `Generated At: ${new Date().toLocaleString()}\n`;
    report += `Project Root: ${this.rootPath}\n`;
    report += `Mode: ${this.shouldDelete ? 'DELETE' : 'SCAN ONLY'}\n\n`;

    if (this.emptyFiles.length > 0) {
      report += `EMPTY FILES (${this.emptyFiles.length}):\n`;
      report += '-'.repeat(80) + '\n';
      this.emptyFiles.forEach((file, index) => {
        report += `${(index + 1).toString().padStart(4)}. ${file}\n`;
      });
      report += '\n';
    } else if (this.checkFiles) {
      report += '✅ No empty files found.\n\n';
    }

    if (this.emptyFolders.length > 0) {
      report += `EMPTY FOLDERS (${this.emptyFolders.length}):\n`;
      report += '-'.repeat(80) + '\n';
      this.emptyFolders.forEach((folder, index) => {
        report += `${(index + 1).toString().padStart(4)}. ${folder}/\n`;
      });
      report += '\n';
    } else if (this.checkFolders) {
      report += '✅ No empty folders found.\n\n';
    }

    if (this.shouldDelete) {
      if (this.deletedFiles.length > 0) {
        report += `DELETED FILES (${this.deletedFiles.length}):\n`;
        report += '-'.repeat(80) + '\n';
        this.deletedFiles.forEach((file, index) => {
          report += `${(index + 1).toString().padStart(4)}. ${file}\n`;
        });
        report += '\n';
      }

      if (this.deletedFolders.length > 0) {
        report += `DELETED FOLDERS (${this.deletedFolders.length}):\n`;
        report += '-'.repeat(80) + '\n';
        this.deletedFolders.forEach((folder, index) => {
          report += `${(index + 1).toString().padStart(4)}. ${folder}/\n`;
        });
        report += '\n';
      }
    }

    if (this.errors.length > 0) {
      report += `ERRORS (${this.errors.length}):\n`;
      report += '-'.repeat(80) + '\n';
      this.errors.forEach((error, index) => {
        report += `${(index + 1).toString().padStart(4)}. ${error}\n`;
      });
      report += '\n';
    }

    report += '='.repeat(80) + '\n';
    report += `SUMMARY:\n`;
    report += `  Empty Files Found: ${this.emptyFiles.length}\n`;
    report += `  Empty Folders Found: ${this.emptyFolders.length}\n`;
    if (this.shouldDelete) {
      report += `  Files Deleted: ${this.deletedFiles.length}\n`;
      report += `  Folders Deleted: ${this.deletedFolders.length}\n`;
    }
    report += `  Errors: ${this.errors.length}\n`;
    report += '='.repeat(80) + '\n';

    return report;
  }

  /**
   * Run the finder
   */
  run() {
    console.log('🔍 Scanning for empty files and folders...');
    console.log(`📁 Root: ${this.rootPath}`);
    console.log(`🚫 Excluding: ${this.excludeDirs.join(', ')}\n`);

    if (this.shouldDelete) {
      console.log('⚠️  DELETE MODE: Empty items will be deleted!\n');
    } else {
      console.log(
        '📋 SCAN MODE: Only listing empty items (use --delete to remove them)\n'
      );
    }

    // Start scanning from root
    this.scanDirectory(this.rootPath);

    // Generate report
    const report = this.generateReport();

    // Print to console
    console.log(report);

    // Save to file if requested
    if (this.outputFile) {
      const outputPath = path.isAbsolute(this.outputFile)
        ? this.outputFile
        : path.join(this.rootPath, this.outputFile);

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, report, 'utf8');
      console.log(`📄 Report saved to: ${outputPath}\n`);
    }

    // Return summary
    return {
      emptyFiles: this.emptyFiles.length,
      emptyFolders: this.emptyFolders.length,
      deletedFiles: this.deletedFiles.length,
      deletedFolders: this.deletedFolders.length,
      errors: this.errors.length,
    };
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--delete') {
    options.delete = true;
  } else if (args[i] === '--no-files') {
    options.files = false;
  } else if (args[i] === '--no-folders') {
    options.folders = false;
  } else if (args[i] === '--exclude' && args[i + 1]) {
    options.exclude = args[i + 1];
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.output = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Empty Files and Folders Finder

Usage: node tools/find-empty-items.js [options]

Options:
  --delete              Delete empty items (default: false, just list them)
  --no-files           Don't check for empty files
  --no-folders         Don't check for empty folders
  --exclude <dirs>      Comma-separated directories to exclude
                       (default: node_modules,dist,.git,.angular,coverage,.vscode,.idea,tools)
  --output <file>      Save report to file (optional)
  --help, -h           Show this help message

Note: .scss and .sass files are never treated as empty for listing/deletion.

Examples:
  # List empty files and folders
  node tools/find-empty-items.js

  # List and delete empty files and folders
  node tools/find-empty-items.js --delete

  # Only check for empty files
  node tools/find-empty-items.js --no-folders

  # Only check for empty folders
  node tools/find-empty-items.js --no-files

  # Save report to file
  node tools/find-empty-items.js --output tools/empty-items-report.txt

  # Delete and save report
  node tools/find-empty-items.js --delete --output tools/deleted-items.txt
    `);
    process.exit(0);
  }
}

// Run the script
try {
  const finder = new EmptyItemsFinder(options);
  const summary = finder.run();

  // Exit with appropriate code
  if (summary.errors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
