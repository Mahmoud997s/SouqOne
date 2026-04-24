import type { FormConfig } from '@/types/form-config';

export const serviceFormConfig: FormConfig = {
  type: 'service',
  titleKey: 'svcTitle',
  submitKey: 'svcSubmit',
  apiEndpoint: '/services',
  uploadEndpoint: '/uploads/services',
  redirectPath: (id) => `/sale/service/${id}`,
  createHook: 'useCreateCarService',
  fetchHook: 'useCarService',
  updateHook: 'useUpdateCarService',
  deleteImageHook: 'useRemoveServiceImage',

  steps: [
    /* ═══════ Step 0: Basic Info ═══════ */
    {
      id: 'basic',
      labelKey: 'svcStepBasic',
      icon: 'handyman',
      requiredFields: ['serviceType', 'title', 'providerName'],
      sections: [
        {
          titleKey: 'svcLabelType',
          icon: 'handyman',
          fields: [
            {
              name: 'serviceType',
              type: 'chip-select',
              labelKey: 'svcLabelType',
              required: true,
              options: [
                { value: 'MAINTENANCE', labelKey: 'svcMaintenance' },
                { value: 'CLEANING', labelKey: 'svcCleaning' },
                { value: 'MODIFICATION', labelKey: 'svcModification' },
                { value: 'INSPECTION', labelKey: 'svcInspection' },
                { value: 'BODYWORK', labelKey: 'svcBodywork' },
                { value: 'ACCESSORIES_INSTALL', labelKey: 'svcAccessories' },
                { value: 'KEYS_LOCKS', labelKey: 'svcKeys' },
                { value: 'TOWING', labelKey: 'svcTowing' },
                { value: 'OTHER_SERVICE', labelKey: 'svcOther' },
              ],
            },
          ],
        },
        {
          titleKey: 'svcLabelPhotos',
          icon: 'add_photo_alternate',
          fields: [
            { name: 'images', type: 'image-upload', labelKey: 'svcLabelPhotos' },
          ],
        },
        {
          titleKey: 'svcLabelProvider',
          icon: 'storefront',
          fields: [
            { name: 'title', type: 'text', labelKey: 'svcLabelTitle', required: true, placeholderKey: 'svcPlaceholderTitle' },
            { name: 'providerName', type: 'text', labelKey: 'svcLabelProvName', required: true, placeholderKey: 'svcPlaceholderProvName' },
            {
              name: 'providerType', type: 'chip-select', labelKey: 'svcLabelProvType', defaultValue: 'WORKSHOP',
              options: [
                { value: 'WORKSHOP', labelKey: 'svcProvWorkshop' },
                { value: 'INDIVIDUAL', labelKey: 'svcProvIndividual' },
                { value: 'MOBILE', labelKey: 'svcProvMobile' },
                { value: 'COMPANY', labelKey: 'svcProvCompany' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 1: Details ═══════ */
    {
      id: 'details',
      labelKey: 'svcStepDetails',
      icon: 'description',
      sections: [
        {
          titleKey: 'svcLabelDetails',
          icon: 'description',
          fields: [
            { name: 'description', type: 'textarea', labelKey: 'svcLabelDesc', placeholderKey: 'svcPlaceholderDesc' },
          ],
        },
        {
          titleKey: 'svcLabelPricing',
          icon: 'payments',
          gridCols: 2,
          fields: [
            { name: 'priceFrom', type: 'number', labelKey: 'svcLabelPriceFrom', step: '0.01', placeholderKey: 'svcPlaceholder5' },
            { name: 'priceTo', type: 'number', labelKey: 'svcLabelPriceTo', step: '0.01', placeholderKey: 'svcPlaceholder50' },
          ],
        },
        {
          titleKey: '',
          fields: [
            { name: 'isHomeService', type: 'checkbox', labelKey: 'svcLabelHomeService', defaultValue: false },
          ],
        },
        {
          titleKey: 'svcLabelHours',
          icon: 'schedule',
          gridCols: 2,
          fields: [
            { name: 'workingHoursOpen', type: 'time', labelKey: 'svcLabelOpenTime', defaultValue: '08:00' },
            { name: 'workingHoursClose', type: 'time', labelKey: 'svcLabelCloseTime', defaultValue: '20:00' },
          ],
        },
        {
          titleKey: 'svcLabelWorkDays',
          icon: 'calendar_month',
          fields: [
            {
              name: 'workingDays', type: 'multi-chip', labelKey: 'svcLabelWorkDays',
              defaultValue: ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'],
              options: [
                { value: 'SAT', labelKey: 'tripDaySat' },
                { value: 'SUN', labelKey: 'tripDaySun' },
                { value: 'MON', labelKey: 'tripDayMon' },
                { value: 'TUE', labelKey: 'tripDayTue' },
                { value: 'WED', labelKey: 'tripDayWed' },
                { value: 'THU', labelKey: 'tripDayThu' },
                { value: 'FRI', labelKey: 'tripDayFri' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 2: Location & Contact ═══════ */
    {
      id: 'location',
      labelKey: 'svcStepLocation',
      icon: 'location_on',
      requiredFields: ['governorate'],
      sections: [
        {
          titleKey: 'svcLabelLocation',
          icon: 'location_on',
          fields: [
            { name: '_location', type: 'location', labelKey: 'svcLabelLocation', showCountry: true, defaultCountry: 'OM' } as any,
            { name: 'address', type: 'text', labelKey: 'svcLabelAddress', placeholderKey: 'svcPlaceholderAddress' },
          ],
        },
        {
          titleKey: 'svcLabelContact',
          icon: 'contact_phone',
          gridCols: 2,
          fields: [
            { name: 'contactPhone', type: 'text', labelKey: 'svcLabelPhone', placeholderKey: 'busPlaceholderPhone' },
            { name: 'whatsapp', type: 'text', labelKey: 'svcLabelWhatsapp', placeholderKey: 'busPlaceholderPhone' },
          ],
        },
        {
          titleKey: '',
          fields: [
            { name: 'website', type: 'text', labelKey: 'svcLabelWebsite', placeholderKey: 'svcPlaceholderWebsite' },
          ],
        },
      ],
    },
  ],

  transformPayload: (data) => {
    const payload = { ...data };
    if (typeof payload.priceFrom === 'string' && payload.priceFrom) payload.priceFrom = parseFloat(payload.priceFrom as string);
    if (typeof payload.priceTo === 'string' && payload.priceTo) payload.priceTo = parseFloat(payload.priceTo as string);
    delete payload._location;
    return payload;
  },
};
