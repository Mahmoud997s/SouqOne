import { Global, Module } from '@nestjs/common';
import { MeiliProvider } from './meili.provider';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

/**
 * SearchModule is global — SearchService can be injected anywhere
 * without importing the module in each feature module.
 */
@Global()
@Module({
  controllers: [SearchController],
  providers: [MeiliProvider, SearchService],
  exports: [SearchService],
})
export class SearchModule {}
