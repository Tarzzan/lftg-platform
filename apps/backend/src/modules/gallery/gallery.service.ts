// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GalleryService {
  private readonly s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

  constructor(private readonly prisma: PrismaService) {}

  async getGallery() {
    // Récupérer les animaux qui ont une imageUrl
    const animals = await this.prisma.animal.findMany({
      where: { imageUrl: { not: null } },
      select: {
        id: true,
        identifier: true,
        name: true,
        imageUrl: true,
        species: { select: { commonName: true, scientificName: true } },
        status: true,
      },
      orderBy: { name: "asc" },
    });

    return animals.map((a) => ({
      id: a.id,
      url: a.imageUrl!,
      thumbnailUrl: a.imageUrl,
      filename: `${a.identifier}.jpg`,
      title: a.name || a.identifier,
      animalId: a.id,
      animalName: a.name || a.identifier,
      category: a.species?.commonName || "Animal",
      description: `${a.species?.scientificName || ""} — ${a.status}`,
    }));
  }

  async getPresignedUrl(fileName: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
