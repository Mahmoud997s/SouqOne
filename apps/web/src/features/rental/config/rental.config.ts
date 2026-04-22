import type { RentalEntityType, UnifiedRentalListing } from '../types/unified-rental.types';
import type { RentalSectionConfig } from '../types/config.types';

/** Extract nested values via dot notation (e.g., 'carData.year') */
export function getNestedValue(obj: UnifiedRentalListing, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, k) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

/** Translation-aware function type */
type T = (key: string, params?: Record<string, string | number>) => string;

export function getRentalConfig(t: T): Record<RentalEntityType, RentalSectionConfig> {
  return {
    car: {
      type: 'car',
      displayName: t('configCar'),
      icon: 'Car',
      specsFields: [
        { key: 'carData.year', label: t('specYear'), icon: 'Calendar', format: 'year' },
        { key: 'carData.mileage', label: t('specMileage'), icon: 'Gauge', format: 'km', unit: t('unitKm'), hideIfEmpty: true },
        { key: 'carData.fuelType', label: t('specEngine'), icon: 'Cog', format: 'text', hideIfEmpty: true },
        { key: 'carData.seats', label: t('specSeats'), icon: 'Users', format: 'number', hideIfEmpty: true },
        { key: 'carData.horsepower', label: t('specPower'), icon: 'Zap', format: 'number', unit: t('unitHp'), hideIfEmpty: true },
        { key: 'carData.doors', label: t('specDoors'), icon: 'DoorOpen', format: 'number', hideIfEmpty: true },
      ],
      tableFields: [
        { key: 'carData.fuelType', label: t('specFuelType'), icon: 'Fuel', hideIfEmpty: true },
        { key: 'carData.transmission', label: t('specTransmission'), icon: 'Settings', hideIfEmpty: true },
        { key: 'carData.bodyType', label: t('specBodyType'), icon: 'Car', hideIfEmpty: true },
        { key: 'carData.engineSize', label: t('specEngineSize'), icon: 'Cog', hideIfEmpty: true },
        { key: 'carData.driveType', label: t('specDriveType'), icon: 'CircleDot', hideIfEmpty: true },
        { key: 'carData.exteriorColor', label: t('specExteriorColor'), icon: 'Palette', hideIfEmpty: true },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'Car',
          getTitle: (d) => t('conditionCar', { condition: d.condition }),
          getSub: () => t('highlightCarReady'),
        },
        {
          icon: 'Shield',
          getTitle: (d) => d.cancellationPolicy ? d.cancellationPolicy : t('highlightCancelDefault'),
          getSub: () => t('highlightCancelPolicy'),
        },
        {
          icon: 'Clock',
          getTitle: (d) => d.minRentalDays ? t('highlightMinDays', { count: d.minRentalDays }) : t('highlightDailyAvailable'),
          getSub: () => t('highlightRentalDuration'),
        },
        {
          icon: 'UserCheck',
          getTitle: (d) => d.withDriver ? t('highlightWithDriver') : t('highlightNoDriver'),
          getSub: () => t('highlightDriverService'),
          condition: (d) => d.withDriver !== undefined,
        },
        {
          icon: 'Truck',
          getTitle: () => t('highlightDelivery'),
          getSub: () => t('highlightDeliveryService'),
          condition: (d) => d.deliveryAvailable === true,
        },
        {
          icon: 'ShieldCheck',
          getTitle: () => t('highlightInsurance'),
          getSub: () => t('highlightInsuranceCoverage'),
          condition: (d) => d.insuranceIncluded === true,
        },
      ],
      badgeColor: 'emerald',
    },

    bus: {
      type: 'bus',
      displayName: t('configBus'),
      icon: 'Bus',
      specsFields: [
        { key: 'busData.capacity', label: t('specCapacity'), icon: 'Users', format: 'number', unit: t('unitPassenger') },
        { key: 'busData.busType', label: t('specBusType'), icon: 'Bus', format: 'text' },
        { key: 'busData.brand', label: t('specBrand'), icon: 'Tag', format: 'text', hideIfEmpty: true },
        { key: 'busData.year', label: t('specYear'), icon: 'Calendar', format: 'year', hideIfEmpty: true },
        { key: 'busData.mileage', label: t('specMileage'), icon: 'Gauge', format: 'km', unit: t('unitKm'), hideIfEmpty: true },
        { key: 'busData.fuelType', label: t('specFuel'), icon: 'Fuel', format: 'text', hideIfEmpty: true },
      ],
      tableFields: [
        { key: 'busData.brand', label: t('specBrand'), icon: 'Tag', hideIfEmpty: true },
        { key: 'busData.model', label: t('specModel'), icon: 'Box', hideIfEmpty: true },
        { key: 'busData.year', label: t('specYear'), icon: 'Calendar', hideIfEmpty: true },
        { key: 'busData.fuelType', label: t('specFuelType'), icon: 'Fuel', hideIfEmpty: true },
        { key: 'busData.transmission', label: t('specTransmission'), icon: 'Settings', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'Bus',
          getTitle: (d) => t('conditionBus', { condition: d.condition }),
          getSub: () => t('highlightBusInspected'),
        },
        {
          icon: 'Users',
          getTitle: (d) => t('highlightCapacity', { count: d.busData?.capacity ?? 0 }),
          getSub: () => t('highlightMaxCapacity'),
        },
        {
          icon: 'Shield',
          getTitle: (d) => d.cancellationPolicy ? d.cancellationPolicy : t('highlightCancelContact'),
          getSub: () => t('highlightCancelPolicy'),
        },
        {
          icon: 'UserCheck',
          getTitle: (d) => d.withDriver ? t('highlightWithDriver') : t('highlightNoDriver'),
          getSub: () => t('highlightDriverService'),
          condition: (d) => d.withDriver !== undefined,
        },
        {
          icon: 'Truck',
          getTitle: () => t('highlightDelivery'),
          getSub: () => t('highlightDeliveryService'),
          condition: (d) => d.deliveryAvailable === true,
        },
        {
          icon: 'ShieldCheck',
          getTitle: () => t('highlightInsurance'),
          getSub: () => t('highlightInsuranceCoverage'),
          condition: (d) => d.insuranceIncluded === true,
        },
      ],
      badgeColor: 'orange',
    },

    equipment: {
      type: 'equipment',
      displayName: t('configEquipment'),
      icon: 'Wrench',
      specsFields: [
        { key: 'equipmentData.category', label: t('specCategory'), icon: 'Grid', format: 'text' },
        { key: 'equipmentData.brand', label: t('specBrand'), icon: 'Tag', format: 'text', hideIfEmpty: true },
        { key: 'equipmentData.model', label: t('specModel'), icon: 'Box', format: 'text', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star', format: 'text' },
      ],
      tableFields: [
        { key: 'equipmentData.category', label: t('specCategory'), icon: 'Grid' },
        { key: 'equipmentData.brand', label: t('specBrand'), icon: 'Tag', hideIfEmpty: true },
        { key: 'equipmentData.model', label: t('specModel'), icon: 'Box', hideIfEmpty: true },
        { key: 'condition', label: t('specCondition'), icon: 'Star' },
        { key: 'governorate', label: t('specGovernorate'), icon: 'MapPin' },
      ],
      highlightFields: [
        {
          icon: 'Wrench',
          getTitle: (d) => t('conditionEquipment', { condition: d.condition }),
          getSub: () => t('highlightEquipmentVerified'),
        },
        {
          icon: 'Shield',
          getTitle: (d) => d.cancellationPolicy ? d.cancellationPolicy : t('highlightCancelContactShort'),
          getSub: () => t('highlightCancelPolicy'),
        },
        {
          icon: 'Clock',
          getTitle: (d) => d.minRentalDays ? t('highlightMinDays', { count: d.minRentalDays }) : t('highlightFlexibleRental'),
          getSub: () => t('highlightRentalDuration'),
        },
        {
          icon: 'UserCheck',
          getTitle: (d) => d.withDriver ? t('highlightWithOperator') : t('highlightNoOperator'),
          getSub: () => t('highlightOperatorService'),
          condition: (d) => d.withDriver !== undefined,
        },
        {
          icon: 'Truck',
          getTitle: () => t('highlightDelivery'),
          getSub: () => t('highlightDeliveryService'),
          condition: (d) => d.deliveryAvailable === true,
        },
        {
          icon: 'ShieldCheck',
          getTitle: () => t('highlightInsurance'),
          getSub: () => t('highlightInsuranceCoverage'),
          condition: (d) => d.insuranceIncluded === true,
        },
      ],
      badgeColor: 'teal',
    },
  };
}
