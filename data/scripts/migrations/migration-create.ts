import { execSync } from 'child_process';

const name = process.env.npm_config_name;

if (!name) {
  console.error(
    '❌ Migration name is required. Use: npm run migration:create --name=my-migration-name',
  );
  process.exit(1);
}

const command = `npx ts-node -r tsconfig-paths/register ./typeorm.custom-cli.ts migration:create ./data/migrations/${name}`;

execSync(command, { stdio: 'inherit' });
