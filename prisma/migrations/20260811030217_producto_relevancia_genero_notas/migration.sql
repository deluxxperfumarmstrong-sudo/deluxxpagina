-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'UNISEX');

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "notas",
ADD COLUMN     "genero" "Genero" NOT NULL DEFAULT 'UNISEX',
ADD COLUMN     "notasCorazon" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notasFondo" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notasSalida" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "relevancia" INTEGER NOT NULL DEFAULT 2;

-- CreateIndex
CREATE INDEX "Producto_relevancia_idx" ON "Producto"("relevancia");

-- CreateIndex
CREATE INDEX "Producto_genero_idx" ON "Producto"("genero");

