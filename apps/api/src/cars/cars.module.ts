import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarImporterService } from './car-importer.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
  ],
  controllers: [CarsController],
  providers: [CarsService, CarImporterService],
  exports: [CarsService, CarImporterService],
})
export class CarsModule {}
