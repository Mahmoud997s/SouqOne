import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly useCloudinary: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
    if (!this.useCloudinary) {
      this.logger.warn('Cloudinary not configured — using local file storage');
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('لم يتم تحميل أي ملف');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('نوع الملف غير مدعوم. يُسمح بـ JPEG, PNG, WebP, AVIF');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('حجم الملف يتجاوز الحد الأقصى (10MB)');
    }

    if (this.useCloudinary) {
      const result = await this.cloudinaryService.upload(file, 'carone/listings');
      return { url: result.secure_url, key: result.public_id };
    }

    // Fallback: local storage
    const ext = path.extname(file.originalname) || '.jpg';
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const dest = path.join(UPLOAD_DIR, key);
    fs.writeFileSync(dest, file.buffer);
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || 4000}`;
    return { url: `${baseUrl}/uploads/${key}`, key };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useCloudinary && key.startsWith('carone/')) {
      await this.cloudinaryService.delete(key);
      return;
    }
    const filePath = path.join(UPLOAD_DIR, path.basename(key));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // ─── Listing Images ───

  async addImageToListing(
    listingId: string,
    userId: string,
    url: string,
    isPrimary: boolean,
  ) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('الإعلان غير موجود');
    if (listing.sellerId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    // Get current max order
    const maxOrder = await this.prisma.listingImage.aggregate({
      where: { listingId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // If marking as primary, unset other primaries
    if (isPrimary) {
      await this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isPrimary: false },
      });
    }

    // If this is the first image, make it primary
    const imageCount = await this.prisma.listingImage.count({ where: { listingId } });
    const shouldBePrimary = isPrimary || imageCount === 0;

    return this.prisma.listingImage.create({
      data: {
        url,
        order: nextOrder,
        isPrimary: shouldBePrimary,
        listingId,
      },
    });
  }

  async removeImageFromListing(imageId: string, userId: string) {
    const image = await this.prisma.listingImage.findUnique({
      where: { id: imageId },
      include: { listing: { select: { sellerId: true, id: true } } },
    });
    if (!image) throw new NotFoundException('الصورة غير موجودة');
    if (image.listing.sellerId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    // Delete the file (Cloudinary or local)
    if (image.url.includes('cloudinary')) {
      // Extract public_id from Cloudinary URL
      const match = image.url.match(/upload\/(?:v\d+\/)?(carone\/.+)\.[a-z]+$/i);
      if (match) await this.deleteFile(match[1]);
    } else {
      const urlParts = image.url.split('/uploads/');
      if (urlParts.length > 1) await this.deleteFile(urlParts[1]);
    }

    await this.prisma.listingImage.delete({ where: { id: imageId } });

    // If deleted image was primary, make the first remaining image primary
    if (image.isPrimary) {
      const first = await this.prisma.listingImage.findFirst({
        where: { listingId: image.listing.id },
        orderBy: { order: 'asc' },
      });
      if (first) {
        await this.prisma.listingImage.update({
          where: { id: first.id },
          data: { isPrimary: true },
        });
      }
    }

    return { message: 'تم حذف الصورة بنجاح' };
  }

  async reorderImages(listingId: string, userId: string, imageIds: string[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('الإعلان غير موجود');
    if (listing.sellerId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    // Update order for each image
    await this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.listingImage.update({
          where: { id },
          data: { order: index, isPrimary: index === 0 },
        }),
      ),
    );

    return { message: 'تم إعادة ترتيب الصور بنجاح' };
  }

  async getListingImages(listingId: string) {
    return this.prisma.listingImage.findMany({
      where: { listingId },
      orderBy: { order: 'asc' },
    });
  }

  // ─── Spare Part Images ───

  async addImageToPart(partId: string, userId: string, url: string, isPrimary: boolean) {
    const part = await this.prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part) throw new NotFoundException('قطعة الغيار غير موجودة');
    if (part.sellerId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    const maxOrder = await this.prisma.sparePartImage.aggregate({ where: { sparePartId: partId }, _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    if (isPrimary) {
      await this.prisma.sparePartImage.updateMany({ where: { sparePartId: partId }, data: { isPrimary: false } });
    }
    const imageCount = await this.prisma.sparePartImage.count({ where: { sparePartId: partId } });
    const shouldBePrimary = isPrimary || imageCount === 0;

    return this.prisma.sparePartImage.create({
      data: { url, order: nextOrder, isPrimary: shouldBePrimary, sparePartId: partId },
    });
  }

  // ─── Car Service Images ───

  async addImageToService(serviceId: string, userId: string, url: string, isPrimary: boolean) {
    const service = await this.prisma.carService.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('الخدمة غير موجودة');
    if (service.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    const maxOrder = await this.prisma.carServiceImage.aggregate({ where: { carServiceId: serviceId }, _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    if (isPrimary) {
      await this.prisma.carServiceImage.updateMany({ where: { carServiceId: serviceId }, data: { isPrimary: false } });
    }
    const imageCount = await this.prisma.carServiceImage.count({ where: { carServiceId: serviceId } });
    const shouldBePrimary = isPrimary || imageCount === 0;

    return this.prisma.carServiceImage.create({
      data: { url, order: nextOrder, isPrimary: shouldBePrimary, carServiceId: serviceId },
    });
  }

  // ─── Transport Images ───

  async addImageToTransport(transportId: string, userId: string, url: string, isPrimary: boolean) {
    const transport = await this.prisma.transportService.findUnique({ where: { id: transportId } });
    if (!transport) throw new NotFoundException('خدمة النقل غير موجودة');
    if (transport.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');

    const maxOrder = await this.prisma.transportImage.aggregate({ where: { transportServiceId: transportId }, _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    if (isPrimary) {
      await this.prisma.transportImage.updateMany({ where: { transportServiceId: transportId }, data: { isPrimary: false } });
    }
    const imageCount = await this.prisma.transportImage.count({ where: { transportServiceId: transportId } });
    const shouldBePrimary = isPrimary || imageCount === 0;

    return this.prisma.transportImage.create({
      data: { url, order: nextOrder, isPrimary: shouldBePrimary, transportServiceId: transportId },
    });
  }
}
