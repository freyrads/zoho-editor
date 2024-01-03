-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "filename" TEXT NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "file_data" TEXT NOT NULL,
    "zoho_document_id" TEXT,
    "author_id" INTEGER NOT NULL,
    "existing" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Document_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("author_id", "deleted", "existing", "file_data", "filename", "id", "title", "zoho_document_id") SELECT "author_id", "deleted", "existing", "file_data", "filename", "id", "title", "zoho_document_id" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_filename_key" ON "Document"("filename");
CREATE UNIQUE INDEX "Document_zoho_document_id_key" ON "Document"("zoho_document_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
