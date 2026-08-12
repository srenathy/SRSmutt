const fs = require('fs');
const path = require('path');

// Load .env from root and apps/api
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '../apps/api/.env') });
} catch (e) {
  // Ignore if dotenv is not available
}

const schemaPath = path.resolve(__dirname, '../apps/api/prisma/schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma not found at:', schemaPath);
  process.exit(1);
}

let schemaContent = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

const currentProviderMatch = schemaContent.match(/provider\s*=\s*"(sqlite|postgresql)"/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  schemaContent = schemaContent.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${targetProvider}"`
  );
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`⚙️ Switched Prisma provider in schema.prisma: ${currentProvider} -> ${targetProvider}`);
} else {
  console.log(`✅ Prisma schema provider already set to: ${targetProvider}`);
}
