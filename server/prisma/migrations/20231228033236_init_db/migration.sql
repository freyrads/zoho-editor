-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "filename" TEXT NOT NULL,
    "zoho_document_id" TEXT,
    "author_id" INTEGER NOT NULL,
    "existing" BOOLEAN NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Document_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZohoSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoho_document_id" TEXT,
    "document_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "session_data" TEXT NOT NULL,
    "session_type" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ZohoSession_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZohoSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_filename_key" ON "Document"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Document_zoho_document_id_key" ON "Document"("zoho_document_id");
