import { execSync } from "child_process";

function applyD1Migrations(dbName: string = "serverless-images-api"): void {
  console.log(`Applying migrations to D1 database: ${dbName}...`);

  try {
    execSync(`echo "Y" | pnpm wrangler d1 migrations apply ${dbName} --local`, {
      stdio: "inherit",
    });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Failed to apply migrations:", error);
    process.exit(1);
  }
}

const dbName = process.argv[2] || "serverless-images-api";
applyD1Migrations(dbName);
