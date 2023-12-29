/*
  Warnings:

  - Made the column `user_id` on table `ZohoSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zoho_document_id` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZohoSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT,
    "zoho_document_id" TEXT,
    "document_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "session_data" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ZohoSession_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ZohoSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ZohoSession" ("deleted", "document_id", "filename", "id", "session_data", "session_type", "user_id", "zoho_document_id") SELECT "deleted", "document_id", "filename", "id", "session_data", "session_type", "user_id", "zoho_document_id" FROM "ZohoSession";
DROP TABLE "ZohoSession";
ALTER TABLE "new_ZohoSession" RENAME TO "ZohoSession";
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "filename" TEXT NOT NULL,
    "zoho_document_id" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "existing" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Document_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("author_id", "deleted", "existing", "filename", "id", "title", "zoho_document_id") SELECT "author_id", "deleted", "existing", "filename", "id", "title", "zoho_document_id" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_filename_key" ON "Document"("filename");
CREATE UNIQUE INDEX "Document_zoho_document_id_key" ON "Document"("zoho_document_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
