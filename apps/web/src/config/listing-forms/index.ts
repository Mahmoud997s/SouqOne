import type { FormConfig } from '@/types/form-config';
import { busFormConfig } from './bus';
import { equipmentFormConfig } from './equipment';
import { partsFormConfig } from './parts';
import { serviceFormConfig } from './service';
import { operatorFormConfig } from './operator';

/** All available listing form configs, keyed by URL slug */
export const listingFormConfigs: Record<string, FormConfig> = {
  bus: busFormConfig,
  equipment: equipmentFormConfig,
  parts: partsFormConfig,
  service: serviceFormConfig,
  operator: operatorFormConfig,
};

/** Valid listing type slugs */
export const validListingTypes = Object.keys(listingFormConfigs);

export {
  busFormConfig,
  equipmentFormConfig,
  partsFormConfig,
  serviceFormConfig,
  operatorFormConfig,
};
