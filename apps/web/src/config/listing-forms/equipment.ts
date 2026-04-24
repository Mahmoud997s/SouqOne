import type { FormConfig } from '@/types/form-config';

export const equipmentFormConfig: FormConfig = {
  type: 'equipment',
  titleKey: 'eqTitle',
  submitKey: 'eqSubmit',
  apiEndpoint: '/equipment',
  uploadEndpoint: '/uploads/equipment',
  redirectPath: (id) => `/sale/equipment/${id}`,
  createHook: 'useCreateEquipmentListing',
  fetchHook: 'useEquipmentListing',
  updateHook: 'useUpdateEquipmentListing',
  deleteImageHook: 'useRemoveEquipmentImage',

  steps: [
    /* ═══════ Step 0: Type ═══════ */
    {
      id: 'type',
      labelKey: 'eqStepType',
      icon: 'category',
      requiredFields: ['listingType', 'equipmentType'],
      sections: [
        {
          titleKey: 'eqLabelAdType',
          icon: 'category',
          fields: [
            {
              name: 'listingType',
              type: 'card-select',
              labelKey: 'eqLabelAdType',
              required: true,
              columns: 2,
              options: [
                { value: 'EQUIPMENT_SALE', labelKey: 'eqTypeSale', icon: 'sell', descKey: 'eqTypeSaleDesc' },
                { value: 'EQUIPMENT_RENT', labelKey: 'eqTypeRent', icon: 'car_rental', descKey: 'eqTypeRentDesc' },
              ],
            },
          ],
        },
        {
          titleKey: 'eqLabelEquipType',
          icon: 'precision_manufacturing',
          fields: [
            {
              name: 'equipmentType',
              type: 'card-select',
              labelKey: 'eqLabelEquipType',
              required: true,
              columns: 5,
              options: [
                { value: 'EXCAVATOR', labelKey: 'eqExcavator', icon: 'precision_manufacturing' },
                { value: 'CRANE', labelKey: 'eqCrane', icon: 'crane' },
                { value: 'LOADER', labelKey: 'eqLoader', icon: 'front_loader' },
                { value: 'BULLDOZER', labelKey: 'eqBulldozer', icon: 'agriculture' },
                { value: 'FORKLIFT', labelKey: 'eqForklift', icon: 'forklift' },
                { value: 'CONCRETE_MIXER', labelKey: 'eqConcreteMixer', icon: 'concrete' },
                { value: 'GENERATOR', labelKey: 'eqGenerator', icon: 'bolt' },
                { value: 'COMPRESSOR', labelKey: 'eqCompressor', icon: 'air' },
                { value: 'SCAFFOLDING', labelKey: 'eqScaffolding', icon: 'construction' },
                { value: 'WELDING_MACHINE', labelKey: 'eqWelding', icon: 'hardware' },
                { value: 'TRUCK', labelKey: 'eqTruck', icon: 'local_shipping' },
                { value: 'DUMP_TRUCK', labelKey: 'eqDumpTruck', icon: 'local_shipping' },
                { value: 'WATER_TANKER', labelKey: 'eqWaterTanker', icon: 'water_drop' },
                { value: 'LIGHT_EQUIPMENT', labelKey: 'eqLightEquip', icon: 'build' },
                { value: 'OTHER_EQUIPMENT', labelKey: 'eqOther', icon: 'category' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 1: Specs ═══════ */
    {
      id: 'specs',
      labelKey: 'eqStepSpecs',
      icon: 'settings',
      requiredFields: ['title', 'description'],
      sections: [
        {
          titleKey: 'eqLabelBasicInfo',
          icon: 'edit',
          fields: [
            { name: 'title', type: 'text', labelKey: 'eqLabelTitle', required: true, placeholderKey: 'eqPlaceholderTitle' },
            { name: 'description', type: 'textarea', labelKey: 'eqLabelDesc', required: true, placeholderKey: 'eqPlaceholderDesc' },
          ],
        },
        {
          titleKey: 'eqLabelTechSpecs',
          icon: 'settings',
          gridCols: 2,
          fields: [
            { name: 'make', type: 'text', labelKey: 'eqLabelBrand', placeholderKey: 'eqPlaceholderCat' },
            { name: 'model', type: 'text', labelKey: 'eqLabelModel', placeholderKey: 'eqPlaceholder320D' },
            { name: 'year', type: 'number', labelKey: 'eqLabelYear', placeholderKey: 'busPlaceholder2020' },
            {
              name: 'condition', type: 'select', labelKey: 'eqLabelCondition', defaultValue: 'USED',
              options: [
                { value: 'NEW', labelKey: 'eqCondNew' },
                { value: 'LIKE_NEW', labelKey: 'eqCondLikeNew' },
                { value: 'GOOD', labelKey: 'eqCondGood' },
                { value: 'USED', labelKey: 'eqCondUsed' },
                { value: 'FAIR', labelKey: 'eqCondFair' },
              ],
            },
            { name: 'capacity', type: 'text', labelKey: 'eqLabelCapacity', placeholderKey: 'eqPlaceholder20ton' },
            { name: 'power', type: 'text', labelKey: 'eqLabelPower', placeholderKey: 'eqPlaceholder150HP' },
            { name: 'weight', type: 'text', labelKey: 'eqLabelWeight', placeholderKey: 'eqPlaceholder22k' },
            { name: 'hoursUsed', type: 'number', labelKey: 'eqLabelHours', placeholderKey: 'eqPlaceholder5000' },
          ],
        },
      ],
    },

    /* ═══════ Step 2: Price & Location ═══════ */
    {
      id: 'price',
      labelKey: 'eqStepPrice',
      icon: 'payments',
      sections: [
        {
          titleKey: 'eqLabelPrice',
          icon: 'payments',
          fields: [
            {
              name: 'price', type: 'number', labelKey: 'eqLabelSalePrice', placeholderKey: 'eqPlaceholderPrice',
              showWhen: { field: 'listingType', equals: 'EQUIPMENT_SALE' },
            },
            {
              name: 'dailyPrice', type: 'number', labelKey: 'eqLabelDaily',
              showWhen: { field: 'listingType', equals: 'EQUIPMENT_RENT' },
            },
            {
              name: 'weeklyPrice', type: 'number', labelKey: 'eqLabelWeekly',
              showWhen: { field: 'listingType', equals: 'EQUIPMENT_RENT' },
            },
            {
              name: 'monthlyPrice', type: 'number', labelKey: 'eqLabelMonthly',
              showWhen: { field: 'listingType', equals: 'EQUIPMENT_RENT' },
            },
            { name: 'isPriceNegotiable', type: 'checkbox', labelKey: 'eqLabelNegotiable', defaultValue: false },
            { name: 'withOperator', type: 'checkbox', labelKey: 'eqLabelWithOperator', defaultValue: false },
            { name: 'deliveryAvailable', type: 'checkbox', labelKey: 'eqLabelDelivery', defaultValue: false },
            {
              name: 'minRentalDays', type: 'number', labelKey: 'eqLabelMinRental',
              showWhen: { field: 'listingType', equals: 'EQUIPMENT_RENT' },
            },
          ],
        },
        {
          titleKey: 'eqLabelLocationContact',
          icon: 'location_on',
          fields: [
            { name: '_location', type: 'location', labelKey: 'eqLabelLocationContact', showCountry: false, defaultCountry: 'OM' } as any,
          ],
        },
        {
          titleKey: 'eqLabelContact',
          icon: 'call',
          gridCols: 2,
          fields: [
            { name: 'contactPhone', type: 'text', labelKey: 'eqLabelPhone', placeholderKey: 'busPlaceholderPhone' },
            { name: 'whatsapp', type: 'text', labelKey: 'eqLabelWhatsapp', placeholderKey: 'busPlaceholderPhone' },
          ],
        },
      ],
    },

    /* ═══════ Step 3: Photos ═══════ */
    {
      id: 'photos',
      labelKey: 'eqStepPhotos',
      icon: 'photo_camera',
      sections: [
        {
          titleKey: 'eqLabelPhotos',
          icon: 'photo_camera',
          fields: [
            { name: 'images', type: 'image-upload', labelKey: 'eqLabelPhotos' },
          ],
        },
      ],
    },
  ],

  transformPayload: (data) => {
    const payload = { ...data };
    delete payload._location;
    return payload;
  },
};
