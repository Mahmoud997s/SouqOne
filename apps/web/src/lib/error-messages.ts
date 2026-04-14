/**
 * Translates raw backend validation errors (class-validator / NestJS)
 * into user-friendly messages via i18n.
 */

type ErrorT = (key: string, params?: Record<string, string | number>) => string;

const FIELD_KEY_MAP: Record<string, string> = {
  title: 'fieldTitle', description: 'fieldDescription', make: 'fieldMake', model: 'fieldModel',
  year: 'fieldYear', price: 'fieldPrice', mileage: 'fieldMileage', fuelType: 'fieldFuelType',
  transmission: 'fieldTransmission', condition: 'fieldCondition', governorate: 'fieldGovernorate',
  city: 'fieldCity', contactPhone: 'fieldContactPhone', whatsapp: 'fieldWhatsapp',
  providerName: 'fieldProviderName', providerType: 'fieldProviderType', serviceType: 'fieldServiceType',
  transportType: 'fieldTransportType', tripType: 'fieldTripType', scheduleType: 'fieldScheduleType',
  pricingType: 'fieldPricingType', offerType: 'fieldOfferType', listingType: 'fieldListingType',
  routeFrom: 'fieldRouteFrom', routeTo: 'fieldRouteTo', partCategory: 'fieldPartCategory',
  pricePerTrip: 'fieldPricePerTrip', priceMonthly: 'fieldPriceMonthly', basePrice: 'fieldBasePrice',
  pricePerKm: 'fieldPricePerKm', priceFrom: 'fieldPriceFrom', priceTo: 'fieldPriceTo',
  dailyPrice: 'fieldDailyPrice', weeklyPrice: 'fieldWeeklyPrice', monthlyPrice: 'fieldMonthlyPrice',
  depositAmount: 'fieldDepositAmount', capacity: 'fieldCapacity', availableSeats: 'fieldAvailableSeats',
  email: 'fieldEmail', password: 'fieldPassword', username: 'fieldUsername', displayName: 'fieldDisplayName',
  website: 'fieldWebsite', address: 'fieldAddress', partNumber: 'fieldPartNumber',
  vehicleType: 'fieldVehicleType', vehicleCapacity: 'fieldVehicleCapacity',
  cancellationPolicy: 'fieldCancellationPolicy',
};

function getFieldNameT(t: ErrorT, raw: string): string {
  const key = FIELD_KEY_MAP[raw];
  return key ? t(key) : raw;
}

const ENUM_KEY_MAP: Record<string, Record<string, string>> = {
  scheduleType: { SCHEDULE_DAILY: 'enumScheduleDaily', SCHEDULE_WEEKLY: 'enumScheduleWeekly', SCHEDULE_MONTHLY: 'enumScheduleMonthly', ONE_TIME: 'enumOneTime' },
  tripType: { BUS_SUBSCRIPTION: 'enumBusSub', SCHOOL_TRANSPORT: 'enumSchoolTransport', TOURISM: 'enumTourism', CORPORATE: 'enumCorporate', CARPOOLING: 'enumCarpooling', OTHER_TRIP: 'enumOtherTrip' },
  transportType: { CARGO: 'enumCargo', FURNITURE: 'enumFurniture', DELIVERY: 'enumDelivery', HEAVY_TRANSPORT: 'enumHeavyTransport', TRUCK_RENTAL: 'enumTruckRental', OTHER_TRANSPORT: 'enumOtherTransport' },
  serviceType: { MAINTENANCE: 'enumMaintenance', CLEANING: 'enumCleaning', MODIFICATION: 'enumModification', INSPECTION: 'enumInspection', BODYWORK: 'enumBodywork', ACCESSORIES_INSTALL: 'enumAccessories', KEYS_LOCKS: 'enumKeys', TOWING: 'enumTowing', OTHER_SERVICE: 'enumOtherService' },
  pricingType: { FIXED: 'enumFixed', PER_KM: 'enumPerKm', PER_TRIP: 'enumPerTrip', HOURLY: 'enumHourly', NEGOTIABLE_PRICE: 'enumNegotiable' },
  providerType: { WORKSHOP: 'enumWorkshop', INDIVIDUAL: 'enumIndividual', MOBILE: 'enumMobile', COMPANY: 'enumCompany' },
  offerType: { CAR_COMPREHENSIVE: 'enumComprehensive', CAR_THIRD_PARTY: 'enumThirdParty', MARINE: 'enumMarine', HEAVY_EQUIPMENT: 'enumEquipIns', FINANCING: 'enumFinancing', LEASING: 'enumLeasing' },
  listingType: { SALE: 'enumSale', RENTAL: 'enumRental' },
  condition: { NEW: 'enumNew', USED: 'enumUsed', REFURBISHED: 'enumRefurbished' },
  partCategory: { ENGINE: 'enumEngine', BODY: 'enumBody', ELECTRICAL: 'enumElectrical', SUSPENSION: 'enumSuspension', BRAKES: 'enumBrakes', INTERIOR: 'enumInterior', TIRES: 'enumTires', BATTERIES: 'enumBatteries', OILS: 'enumOils', ACCESSORIES: 'enumAccessoriesPart', OTHER: 'enumOther' },
};

function translateOneT(t: ErrorT, msg: string): string {
  if (/[\u0600-\u06FF]/.test(msg) && !msg.includes('must be')) return msg;

  const enumMatch = msg.match(/^(\w+) must be one of the following values: (.+)$/);
  if (enumMatch) {
    const field = getFieldNameT(t, enumMatch[1]);
    const enumKeys = ENUM_KEY_MAP[enumMatch[1]];
    if (enumKeys) {
      const options = Object.values(enumKeys).map(k => t(k)).join(', ');
      return t('errEnum', { field, options });
    }
    return t('errEnumFallback', { field });
  }

  const emptyMatch = msg.match(/^(\w+) should not be empty$/);
  if (emptyMatch) return t('errRequired', { field: getFieldNameT(t, emptyMatch[1]) });

  const stringMatch = msg.match(/^(\w+) must be a string$/);
  if (stringMatch) return t('errRequired', { field: getFieldNameT(t, stringMatch[1]) });

  const numberMatch = msg.match(/^(\w+) must be a number/);
  if (numberMatch) return t('errNumber', { field: getFieldNameT(t, numberMatch[1]) });

  const intMatch = msg.match(/^(\w+) must be an integer/);
  if (intMatch) return t('errInteger', { field: getFieldNameT(t, intMatch[1]) });

  const minMatch = msg.match(/^(\w+) must not be less than (\d+)$/);
  if (minMatch) return t('errMin', { field: getFieldNameT(t, minMatch[1]), value: minMatch[2] });

  const maxMatch = msg.match(/^(\w+) must not be greater than (\d+)$/);
  if (maxMatch) return t('errMax', { field: getFieldNameT(t, maxMatch[1]), value: maxMatch[2] });

  const minLenMatch = msg.match(/^(\w+) must be longer than or equal to (\d+) characters$/);
  if (minLenMatch) return t('errMinLen', { field: getFieldNameT(t, minLenMatch[1]), count: minLenMatch[2] });

  const maxLenMatch = msg.match(/^(\w+) must be shorter than or equal to (\d+) characters$/);
  if (maxLenMatch) return t('errMaxLen', { field: getFieldNameT(t, maxLenMatch[1]), count: maxLenMatch[2] });

  const emailMatch = msg.match(/^(\w+) must be an email$/);
  if (emailMatch) return t('errEmail');

  const dateMatch = msg.match(/^(\w+) must be a valid ISO 8601 date/);
  if (dateMatch) return t('errDate', { field: getFieldNameT(t, dateMatch[1]) });

  const urlMatch = msg.match(/^(\w+) must be a(n)? URL/);
  if (urlMatch) return t('errUrl', { field: getFieldNameT(t, urlMatch[1]) });

  const boolMatch = msg.match(/^(\w+) must be a boolean/);
  if (boolMatch) return t('errBoolean', { field: getFieldNameT(t, boolMatch[1]) });

  const eachMatch = msg.match(/^each value in (\w+)/);
  if (eachMatch) return t('errInvalidValues', { field: getFieldNameT(t, eachMatch[1]) });

  const arrayMatch = msg.match(/^(\w+) must be an array$/);
  if (arrayMatch) return t('errArray', { field: getFieldNameT(t, arrayMatch[1]) });

  const propMatch = msg.match(/^property (\w+) should not exist$/);
  if (propMatch) return t('errPropNotAllowed', { field: getFieldNameT(t, propMatch[1]) });

  if (msg === 'Unauthorized') return t('errUnauthorized');
  if (msg === 'Forbidden resource') return t('errForbidden');
  if (/not found|Not Found/i.test(msg)) return t('errNotFound');
  if (/already exists|Duplicate/i.test(msg)) return t('errDuplicate');
  if (msg === 'SERVER_ERROR') return t('errServerError');
  if (msg === 'UPLOAD_FAILED') return t('errUploadFailed');

  return msg;
}

export function translateApiErrorsT(t: ErrorT, raw: string | string[]): string[] {
  const messages = Array.isArray(raw) ? raw : [raw];
  return messages.map(m => translateOneT(t, m));
}

export function translateApiErrorT(t: ErrorT, raw: string | string[]): string {
  return translateApiErrorsT(t, raw).join('\n');
}
