import dotenv from "dotenv";
import connectDB from "../config/db.config.js";
import User from "../models/User.model.js";

dotenv.config();

await connectDB();

console.log("Starting migration of user accounts to 'roles' array...");

// Use raw collection to read documents regardless of schema casting
const rawUsers = await User.collection.find({}).toArray();

console.log(`Found ${rawUsers.length} total user accounts to check.`);

let migratedCount = 0;
let alreadyUpToDateCount = 0;

for (const user of rawUsers) {
  const oldRole = user.role;
  const existingRoles = Array.isArray(user.roles) ? user.roles : null;

  let targetRoles = [];

  if (existingRoles && existingRoles.length > 0) {
    targetRoles = [...new Set([...existingRoles, ...(oldRole ? [oldRole] : [])])];
  } else if (oldRole) {
    targetRoles = [oldRole];
  } else {
    targetRoles = ["exhibitor"];
  }

  // Check if migration is needed (i.e. 'roles' needs update or 'role' field still exists)
  const needsRolesUpdate =
    !existingRoles ||
    existingRoles.length !== targetRoles.length ||
    existingRoles.some((r, i) => r !== targetRoles[i]);

  const hasOldRoleField = "role" in user;

  if (needsRolesUpdate || hasOldRoleField) {
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: { roles: targetRoles },
        $unset: { role: "" },
      }
    );

    console.log(
      `✓ Migrated user: ${user.email} | old role: ${oldRole || "none"} -> roles: ${JSON.stringify(targetRoles)}`
    );
    migratedCount++;
  } else {
    alreadyUpToDateCount++;
  }
}

console.log("\nMigration completed successfully!");
console.log(`- Accounts migrated: ${migratedCount}`);
console.log(`- Accounts already up-to-date: ${alreadyUpToDateCount}`);
console.log(`- Total accounts: ${rawUsers.length}`);

process.exit(0);
