/*
  Warnings:

  - Added the required column `zoho_document_id` to the `ZohoSession` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZohoSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "zoho_document_id" TEXT NOT NULL,
    "session_data" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ZohoSession_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ZohoSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ZohoSession" ("deleted", "document_id", "id", "session_data", "session_id", "session_type", "user_id") SELECT "deleted", "document_id", "id", "session_data", "session_id", "session_type", "user_id" FROM "ZohoSession";
DROP TABLE "ZohoSession";
ALTER TABLE "new_ZohoSession" RENAME TO "ZohoSession";
CREATE UNIQUE INDEX "ZohoSession_session_id_key" ON "ZohoSession"("session_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
