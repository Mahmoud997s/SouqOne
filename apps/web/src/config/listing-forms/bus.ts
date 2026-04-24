import type { FormConfig } from '@/types/form-config';

export const busFormConfig: FormConfig = {
  type: 'bus',
  titleKey: 'busTitle',
  submitKey: 'busSubmit',
  apiEndpoint: '/buses',
  uploadEndpoint: '/uploads/buses',
  redirectPath: (id) => `/sale/bus/${id}`,
  createHook: 'useCreateBusListing',
  fetchHook: 'useBusListing',
  updateHook: 'useUpdateBusListing',
  deleteImageHook: 'useRemoveBusImage',

  steps: [
    /* ═══════ Step 0: Ad Type & Bus Type ═══════ */
    {
      id: 'type',
      labelKey: 'busStepAdType',
      icon: 'category',
      requiredFields: ['busListingType'],
      sections: [
        {
          titleKey: 'busLabelAdType',
          icon: 'category',
          fields: [
            {
              name: 'busListingType',
              type: 'card-select',
              labelKey: 'busLabelAdType',
              required: true,
              columns: 2,
              options: [
                { value: 'BUS_SALE', labelKey: 'busTypeSale', icon: 'sell', descKey: 'busTypeSaleDesc' },
                { value: 'BUS_SALE_WITH_CONTRACT', labelKey: 'busTypeSaleContract', icon: 'assignment', descKey: 'busTypeSaleContractDesc' },
                { value: 'BUS_RENT', labelKey: 'busTypeRent', icon: 'car_rental', descKey: 'busTypeRentDesc' },
                { value: 'BUS_CONTRACT', labelKey: 'busTypeContract', icon: 'request_quote', descKey: 'busTypeContractDesc' },
              ],
            },
          ],
        },
        {
          titleKey: 'busLabelBusType',
          icon: 'directions_bus',
          showWhen: { field: 'busListingType', notEquals: 'BUS_CONTRACT' },
          fields: [
            {
              name: 'busType',
              type: 'chip-select',
              labelKey: 'busLabelBusType',
              required: true,
              options: [
                { value: 'MINI_BUS', labelKey: 'busSizeMini', descKey: 'busSizeMiniDesc' },
                { value: 'MEDIUM_BUS', labelKey: 'busSizeMedium', descKey: 'busSizeMediumDesc' },
                { value: 'LARGE_BUS', labelKey: 'busSizeLarge', descKey: 'busSizeLargeDesc' },
                { value: 'COASTER', labelKey: 'busSizeCoaster', descKey: 'busSizeCoasterDesc' },
                { value: 'SCHOOL_BUS', labelKey: 'busSizeSchool', descKey: 'busSizeSchoolDesc' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 1a: Contract Request Details (only for BUS_CONTRACT) ═══════ */
    {
      id: 'contract-details',
      labelKey: 'busStepContractDetails',
      icon: 'request_quote',
      showWhen: { field: 'busListingType', equals: 'BUS_CONTRACT' },
      requiredFields: ['title', 'requestPassengers'],
      sections: [
        {
          titleKey: 'busLabelBasicInfo',
          icon: 'edit',
          fields: [
            { name: 'title', type: 'text', labelKey: 'busLabelAdTitle', required: true, placeholderKey: 'busPlaceholderContract' },
            { name: 'description', type: 'textarea', labelKey: 'busLabelDescription', placeholderKey: 'busPlaceholderDesc' },
          ],
        },
        {
          titleKey: 'busLabelContractDetails',
          icon: 'request_quote',
          gridCols: 2,
          fields: [
            { name: 'requestPassengers', type: 'number', labelKey: 'busLabelPassengers', required: true, placeholderKey: 'busPlaceholder30' },
            {
              name: 'requestSchedule', type: 'select', labelKey: 'busLabelSchedule',
              options: [
                { value: 'daily', labelKey: 'busScheduleDaily' },
                { value: 'weekly', labelKey: 'busScheduleWeekly' },
                { value: 'monthly', labelKey: 'busScheduleMonthly' },
                { value: 'one_trip', labelKey: 'busScheduleOneTrip' },
              ],
            },
            { name: 'requestRoute', type: 'text', labelKey: 'busLabelRoute', placeholderKey: 'busPlaceholderRoute', colSpan: 2 },
            {
              name: 'contractType', type: 'chip-select', labelKey: 'busLabelContractType', colSpan: 2,
              options: [
                { value: 'SCHOOL', labelKey: 'busContractSchool' },
                { value: 'COMPANY', labelKey: 'busContractCompany' },
                { value: 'GOVERNMENT', labelKey: 'busContractGov' },
                { value: 'TOURISM', labelKey: 'busContractTourism' },
                { value: 'OTHER_CONTRACT', labelKey: 'busContractOther' },
              ],
            },
            { name: 'price', type: 'number', labelKey: 'busLabelMonthlyBudget', placeholderKey: 'busPlaceholderOptional' },
          ],
        },
      ],
    },

    /* ═══════ Step 1b: Bus Info (for non-contract types) ═══════ */
    {
      id: 'bus-info',
      labelKey: 'busStepBusInfo',
      icon: 'edit',
      showWhen: { field: 'busListingType', notEquals: 'BUS_CONTRACT' },
      requiredFields: ['title', 'make', 'year', 'capacity'],
      sections: [
        {
          titleKey: 'busLabelBasicInfo',
          icon: 'edit',
          fields: [
            { name: 'title', type: 'text', labelKey: 'busLabelAdTitle', required: true, placeholderKey: 'busPlaceholderBus' },
            { name: 'description', type: 'textarea', labelKey: 'busLabelDescription', placeholderKey: 'busPlaceholderDesc' },
          ],
        },
        {
          titleKey: 'busLabelBusData',
          icon: 'directions_bus',
          gridCols: 2,
          fields: [
            { name: 'make', type: 'text', labelKey: 'busLabelBrand', required: true, placeholderKey: 'busPlaceholderBrand' },
            { name: 'model', type: 'text', labelKey: 'busLabelModel', placeholderKey: 'busPlaceholderModel' },
            { name: 'year', type: 'number', labelKey: 'busLabelYear', required: true, placeholderKey: 'busPlaceholder2020' },
            { name: 'capacity', type: 'number', labelKey: 'busLabelCapacity', required: true, placeholderKey: 'busPlaceholder30' },
            { name: 'mileage', type: 'number', labelKey: 'busLabelMileage', placeholderKey: 'busPlaceholder100k' },
            { name: 'plateNumber', type: 'text', labelKey: 'busLabelPlate' },
          ],
        },
        {
          titleKey: 'busLabelSpecs',
          icon: 'tune',
          gridCols: 2,
          fields: [
            {
              name: 'fuelType', type: 'chip-select', labelKey: 'busLabelFuel',
              options: [
                { value: 'DIESEL', labelKey: 'busFuelDiesel' },
                { value: 'PETROL', labelKey: 'busFuelPetrol' },
                { value: 'HYBRID', labelKey: 'busFuelHybrid' },
                { value: 'ELECTRIC', labelKey: 'busFuelElectric' },
              ],
            },
            {
              name: 'transmission', type: 'chip-select', labelKey: 'busLabelTransmission',
              options: [
                { value: 'AUTOMATIC', labelKey: 'busTransAutomatic' },
                { value: 'MANUAL', labelKey: 'busTransManual' },
              ],
            },
            {
              name: 'condition', type: 'chip-select', labelKey: 'busLabelCondition', colSpan: 2,
              defaultValue: 'USED',
              options: [
                { value: 'NEW', labelKey: 'busCondNew' },
                { value: 'LIKE_NEW', labelKey: 'busCondLikeNew' },
                { value: 'USED', labelKey: 'busCondUsed' },
                { value: 'GOOD', labelKey: 'busCondGood' },
                { value: 'FAIR', labelKey: 'busCondFair' },
              ],
            },
          ],
        },
        {
          titleKey: 'busLabelFeatures',
          icon: 'star',
          fields: [
            {
              name: 'features', type: 'multi-chip', labelKey: 'busLabelFeatures',
              defaultValue: [],
              options: [
                { value: 'busFeatAC', labelKey: 'busFeatAC' },
                { value: 'busFeatWifi', labelKey: 'busFeatWifi' },
                { value: 'busFeatScreens', labelKey: 'busFeatScreens' },
                { value: 'busFeatUSB', labelKey: 'busFeatUSB' },
                { value: 'busFeatLeather', labelKey: 'busFeatLeather' },
                { value: 'busFeatSeatbelt', labelKey: 'busFeatSeatbelt' },
                { value: 'busFeatCamera', labelKey: 'busFeatCamera' },
                { value: 'busFeatGPS', labelKey: 'busFeatGPS' },
                { value: 'busFeatLuggage', labelKey: 'busFeatLuggage' },
                { value: 'busFeatHydraulic', labelKey: 'busFeatHydraulic' },
                { value: 'busFeatFridge', labelKey: 'busFeatFridge' },
                { value: 'busFeatMic', labelKey: 'busFeatMic' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 2: Price & Details (non-contract only) ═══════ */
    {
      id: 'price',
      labelKey: 'busStepPriceDetails',
      icon: 'payments',
      showWhen: { field: 'busListingType', notEquals: 'BUS_CONTRACT' },
      sections: [
        /* Sale price */
        {
          titleKey: 'busLabelPrice',
          icon: 'payments',
          showWhen: { field: 'busListingType', equals: ['BUS_SALE', 'BUS_SALE_WITH_CONTRACT'] },
          gridCols: 2,
          fields: [
            { name: 'price', type: 'number', labelKey: 'busLabelSalePrice', required: true, placeholderKey: 'busPlaceholder8000' },
            { name: 'isPriceNegotiable', type: 'checkbox', labelKey: 'busLabelNegotiable', defaultValue: false },
          ],
        },
        /* Contract attached to sale */
        {
          titleKey: 'busLabelContractAttached',
          icon: 'assignment',
          showWhen: { field: 'busListingType', equals: 'BUS_SALE_WITH_CONTRACT' },
          gridCols: 2,
          fields: [
            {
              name: 'contractType', type: 'chip-select', labelKey: 'busLabelContractType', colSpan: 2,
              options: [
                { value: 'SCHOOL', labelKey: 'busContractSchool' },
                { value: 'COMPANY', labelKey: 'busContractCompany' },
                { value: 'GOVERNMENT', labelKey: 'busContractGov' },
                { value: 'TOURISM', labelKey: 'busContractTourism' },
                { value: 'OTHER_CONTRACT', labelKey: 'busContractOther' },
              ],
            },
            { name: 'contractClient', type: 'text', labelKey: 'busLabelClientName', placeholderKey: 'busPlaceholderClient' },
            { name: 'contractMonthly', type: 'number', labelKey: 'busLabelMonthlySalary', placeholderKey: 'busPlaceholder400' },
            { name: 'contractDuration', type: 'number', labelKey: 'busLabelContractDuration', placeholderKey: 'busPlaceholder12' },
            { name: 'contractExpiry', type: 'date', labelKey: 'busLabelContractExpiry' },
          ],
        },
        /* Rental prices */
        {
          titleKey: 'busLabelRentalPrices',
          icon: 'car_rental',
          showWhen: { field: 'busListingType', equals: 'BUS_RENT' },
          gridCols: 2,
          fields: [
            { name: 'dailyPrice', type: 'number', labelKey: 'busLabelDailyPrice', placeholderKey: 'busPlaceholder70' },
            { name: 'monthlyPrice', type: 'number', labelKey: 'busLabelMonthlyPrice', placeholderKey: 'busPlaceholder1500' },
            { name: 'minRentalDays', type: 'number', labelKey: 'busLabelMinRental', placeholderKey: 'busPlaceholder1' },
            { name: 'withDriver', type: 'checkbox', labelKey: 'busLabelWithDriver', defaultValue: false },
            { name: 'deliveryAvailable', type: 'checkbox', labelKey: 'busLabelDelivery', defaultValue: false },
          ],
        },
      ],
    },

    /* ═══════ Step 3 (last): Location + Contact + Photos ═══════ */
    {
      id: 'location-photos',
      labelKey: 'busStepLocationPhotos',
      icon: 'location_on',
      sections: [
        {
          titleKey: 'busLabelLocation',
          icon: 'location_on',
          fields: [
            { name: '_location', type: 'location', labelKey: 'busLabelLocation', showCountry: true, defaultCountry: 'OM' } as any,
          ],
        },
        {
          titleKey: 'busLabelContact',
          icon: 'call',
          gridCols: 2,
          fields: [
            { name: 'contactPhone', type: 'text', labelKey: 'busLabelPhone', placeholderKey: 'busPlaceholderPhone' },
            { name: 'whatsapp', type: 'text', labelKey: 'busLabelWhatsapp', placeholderKey: 'busPlaceholderPhone' },
          ],
        },
        {
          titleKey: 'busLabelPhotos',
          icon: 'photo_camera',
          showWhen: { field: 'busListingType', notEquals: 'BUS_CONTRACT' },
          fields: [
            { name: 'images', type: 'image-upload', labelKey: 'busLabelPhotos', maxImages: 10 },
          ],
        },
      ],
    },
  ],

  transformPayload: (data) => {
    const payload = { ...data };
    // Default busType for contracts
    if (payload.busListingType === 'BUS_CONTRACT' && !payload.busType) {
      payload.busType = 'MEDIUM_BUS';
    }
    // Default description
    if (!payload.description && payload.title) {
      payload.description = payload.title;
    }
    // Default year
    if (!payload.year) {
      payload.year = new Date().getFullYear();
    }
    // Default capacity
    if (!payload.capacity) {
      payload.capacity = 30;
    }
    // Remove internal fields
    delete payload._location;
    return payload;
  },
};
