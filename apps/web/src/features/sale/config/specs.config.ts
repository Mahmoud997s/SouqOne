/**
 * Section configurations for all 5 sale listing types.
 * Defines how each type displays specs, tables, and highlights.
 */

import type { SaleEntityType, UnifiedListing } from '../types/unified.types';
import type { SectionConfig } from '../types/config.types';

/**
 * Helper to extract nested values from the unified listing object.
 * Supports dot notation (e.g., 'carData.year').
 */
export function getNestedValue(obj: UnifiedListing, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, k) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

/**
 * Configuration for all sale listing types.
 * Accepts a translation function `t` from useTranslations('sale').
 */
export function getSaleConfig(t: (key: string, values?: Record<string, string | number | Date>) => string): Record<SaleEntityType, SectionConfig> {
  return {
    car: {
      type: 'car',
      displayName: t('configCar'),
      icon: 'Car',
      specsFields: [
        { key: 'carData.year', label: t('specYear'), icon: 'Calendar', format: 'year' },
        { key: 'carData.mileage', label: t('specMileage'), icon: 'Gauge', format: 'km', unit: t('unitKm') },
        { key: 'carData.engine', label: t('specEngine'), icon: 'Cog', format: 'text', hideIfEmpty: true },
        { key: 'carData.horsepower', label: t('specHorsepower'), icon: 'Zap', format: 'number', unit: 'hp', hideIfEmpty: true },
      ],
      tableFields: [
        { key: 'carData.exteriorColor', label: t('specExteriorColor'), icon: 'Palette', hideIfEmpty: true },
        { key: 'carData.interiorColor', label: t('specInteriorColor'), icon: 'Palette', hideIfEmpty: true },
        { key: 'carData.fuelType', label: t('specFuelType'), icon: 'Fuel', hideIfEmpty: true },
        { key: 'carData.transmission', label: t('specTransmission'), icon: 'Settings', hideIfEmpty: true },
        { key: 'carData.bodyType', label: t('specBodyType'), icon: 'Car', hideIfEmpty: true },
        { key: 'carData.driveType', label: t('specDriveType'), icon: 'Navigation', hideIfEmpty: true },
        { key: 'carData.doors', label: t('specDoors'), icon: 'DoorOpen', hideIfEmpty: true },
        { key: 'carData.seats', label: t('specSeats'), icon: 'Users', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'ShieldCheck',
          getTitle: (d) => t('highlightCondition', { condition: d.condition }),
          getSub: (d) => (d.condition === 'جديد' || d.condition === 'NEW' ? t('highlightCarNew') : t('highlightCarUsed')),
        },
        {
          icon: 'BadgePercent',
          getTitle: (d) => (d.negotiable ? t('highlightNegotiable') : t('highlightFixedPrice')),
          getSub: (d) => (d.negotiable ? t('highlightNegotiableSub') : t('highlightFixedPriceSub')),
        },
      ],
      badgeColor: 'blue',
    },

    bus: {
      type: 'bus',
      displayName: t('configBus'),
      icon: 'Bus',
      specsFields: [
        { key: 'busData.year', label: t('specYear'), icon: 'Calendar', format: 'year' },
        { key: 'busData.capacity', label: t('specCapacity'), icon: 'Users', format: 'number', unit: t('unitPassenger') },
        { key: 'busData.busType', label: t('specBusType'), icon: 'Bus', format: 'text' },
        { key: 'busData.brand', label: t('specBrand'), icon: 'Tag', format: 'text' },
      ],
      tableFields: [
        { key: 'busData.contractType', label: t('specContractType'), icon: 'FileText' },
        { key: 'busData.brand', label: t('specBrand'), icon: 'Tag' },
        { key: 'busData.year', label: t('specYear'), icon: 'Calendar' },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'ShieldCheck',
          getTitle: (d) => t('highlightCondition', { condition: d.condition }),
          getSub: () => t('highlightBusChecked'),
        },
        {
          icon: 'FileText',
          getTitle: (d) => d.busData?.contractType ?? t('highlightDirectSale'),
          getSub: () => t('highlightContractDetails'),
        },
        {
          icon: 'BadgePercent',
          getTitle: (d) => (d.negotiable ? t('highlightNegotiable') : t('highlightFixedPrice')),
          getSub: (d) => (d.negotiable ? t('highlightNegotiableShort') : t('highlightFixedPriceShort')),
        },
      ],
      badgeColor: 'orange',
    },

    equipment: {
      type: 'equipment',
      displayName: t('configEquipment'),
      icon: 'Wrench',
      specsFields: [
        { key: 'equipmentData.year', label: t('specYear'), icon: 'Calendar', format: 'year', hideIfEmpty: true },
        { key: 'equipmentData.brand', label: t('specBrand'), icon: 'Tag', format: 'text', hideIfEmpty: true },
        { key: 'equipmentData.category', label: t('specCategory'), icon: 'Grid', format: 'text' },
        { key: 'condition', label: t('specCondition'), icon: 'Star', format: 'text' },
      ],
      tableFields: [
        { key: 'equipmentData.brand', label: t('specBrand'), icon: 'Tag', hideIfEmpty: true },
        { key: 'equipmentData.model', label: t('specModel'), icon: 'Box', hideIfEmpty: true },
        { key: 'equipmentData.category', label: t('specCategory'), icon: 'Grid' },
        { key: 'equipmentData.hoursUsed', label: t('specHoursUsed'), icon: 'Clock', hideIfEmpty: true },
        { key: 'equipmentData.warranty', label: t('specWarranty'), icon: 'Shield', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'ShieldCheck',
          getTitle: (d) => t('highlightCondition', { condition: d.condition }),
          getSub: () => t('highlightEquipmentChecked'),
        },
        {
          icon: 'BadgePercent',
          getTitle: (d) => (d.negotiable ? t('highlightNegotiable') : t('highlightFixedPrice')),
          getSub: (d) => (d.negotiable ? t('highlightNegotiableShort') : t('highlightFixedPriceShort')),
        },
        {
          icon: 'Wrench',
          getTitle: (d) => (d.equipmentData?.warranty ? t('highlightWithWarranty') : t('highlightNoWarranty')),
          getSub: (d) => d.equipmentData?.warranty ?? t('highlightContactSeller'),
        },
      ],
      badgeColor: 'teal',
    },

    part: {
      type: 'part',
      displayName: t('configPart'),
      icon: 'Settings',
      specsFields: [
        { key: 'partData.category', label: t('specCategory'), icon: 'Grid', format: 'text' },
        { key: 'partData.brand', label: t('specBrand'), icon: 'Tag', format: 'text', hideIfEmpty: true },
        { key: 'partData.partNumber', label: t('specPartNumber'), icon: 'Hash', format: 'text', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star', format: 'text' },
      ],
      tableFields: [
        { key: 'partData.partNumber', label: t('specPartNumber'), icon: 'Hash', hideIfEmpty: true },
        { key: 'partData.brand', label: t('specBrand'), icon: 'Tag', hideIfEmpty: true },
        { key: 'partData.category', label: t('specCategory'), icon: 'Grid' },
        { key: 'partData.isOriginal', label: t('specIsOriginal'), icon: 'BadgeCheck', format: 'boolean' },
        { key: 'partData.compatibility', label: t('specCompatibility'), icon: 'Car', hideIfEmpty: true },
        { key: 'partData.compatibleModels', label: t('specCompatibleModels'), icon: 'Box', hideIfEmpty: true },
        { key: 'partData.yearRange', label: t('specYearRange'), icon: 'Calendar', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'ShieldCheck',
          getTitle: (d) => t('highlightCondition', { condition: d.condition }),
          getSub: (d) => (d.condition === 'جديد' || d.condition === 'NEW' ? t('highlightPartNew') : t('highlightPartUsed')),
        },
        {
          icon: 'BadgePercent',
          getTitle: (d) => (d.negotiable ? t('highlightNegotiable') : t('highlightFixedPrice')),
          getSub: (d) => (d.negotiable ? t('highlightNegotiableShort') : t('highlightFixedPriceShort')),
        },
      ],
      badgeColor: 'purple',
    },

    service: {
      type: 'service',
      displayName: t('configService'),
      icon: 'Briefcase',
      specsFields: [
        { key: 'serviceData.serviceType', label: t('specServiceType'), icon: 'Briefcase', format: 'text' },
        { key: 'serviceData.providerType', label: t('specProviderType'), icon: 'User', format: 'text', hideIfEmpty: true },
        { key: 'serviceData.homeService', label: t('specHomeService'), icon: 'Home', format: 'boolean' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin', format: 'text' },
      ],
      tableFields: [
        { key: 'serviceData.serviceType', label: t('specServiceType'), icon: 'Briefcase' },
        { key: 'serviceData.providerType', label: t('specProviderType'), icon: 'User', hideIfEmpty: true },
        { key: 'serviceData.workingHours', label: t('specWorkingHours'), icon: 'Clock', hideIfEmpty: true },
        { key: 'serviceData.homeService', label: t('specHomeService'), icon: 'Home' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'BadgeCheck',
          getTitle: (d) => d.seller.verified ? t('highlightVerifiedProvider') : t('highlightUnverifiedProvider'),
          getSub: (d) => d.seller.verified ? t('highlightVerifiedSub') : t('highlightUnverifiedSub'),
        },
        {
          icon: 'Home',
          getTitle: (d) => (d.serviceData?.homeService ? t('highlightHomeServiceAvail') : t('highlightOnSiteOnly')),
          getSub: (d) => (d.serviceData?.homeService ? t('highlightHomeServiceSub') : t('highlightOnSiteSub')),
        },
        {
          icon: 'BadgePercent',
          getTitle: (d) => (d.negotiable ? t('highlightServiceNegotiable') : t('highlightServiceFixed')),
          getSub: (d) => (d.negotiable ? t('highlightServiceNegotiableSub') : t('highlightServiceFixedSub')),
        },
      ],
      badgeColor: 'green',
    },
  };
}
