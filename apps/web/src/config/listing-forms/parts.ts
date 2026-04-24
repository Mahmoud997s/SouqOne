import type { FormConfig } from '@/types/form-config';

export const partsFormConfig: FormConfig = {
  type: 'parts',
  titleKey: 'partTitle',
  submitKey: 'partSubmit',
  apiEndpoint: '/parts',
  uploadEndpoint: '/uploads/parts',
  redirectPath: (id) => `/sale/part/${id}`,
  createHook: 'useCreatePart',
  fetchHook: 'usePart',
  updateHook: 'useUpdatePart',
  deleteImageHook: 'useRemovePartImage',

  steps: [
    /* ═══════ Step 0: Basic Info ═══════ */
    {
      id: 'basic',
      labelKey: 'partStepBasic',
      icon: 'settings',
      requiredFields: ['partCategory', 'title'],
      sections: [
        {
          titleKey: 'partLabelSection',
          icon: 'settings',
          fields: [
            {
              name: 'partCategory',
              type: 'chip-select',
              labelKey: 'partLabelCategory',
              required: true,
              options: [
                { value: 'ENGINE', labelKey: 'partCatEngine' },
                { value: 'BODY', labelKey: 'partCatBody' },
                { value: 'ELECTRICAL', labelKey: 'partCatElectrical' },
                { value: 'SUSPENSION', labelKey: 'partCatSuspension' },
                { value: 'BRAKES', labelKey: 'partCatBrakes' },
                { value: 'INTERIOR', labelKey: 'partCatInterior' },
                { value: 'TIRES', labelKey: 'partCatTires' },
                { value: 'BATTERIES', labelKey: 'partCatBatteries' },
                { value: 'OILS', labelKey: 'partCatOils' },
                { value: 'ACCESSORIES', labelKey: 'partCatAccessories' },
                { value: 'OTHER', labelKey: 'partCatOther' },
              ],
            },
          ],
        },
        {
          titleKey: 'partLabelPhotos',
          icon: 'add_photo_alternate',
          fields: [
            { name: 'images', type: 'image-upload', labelKey: 'partLabelPhotos' },
          ],
        },
        {
          titleKey: 'partLabelBasicInfo',
          icon: 'edit_note',
          fields: [
            { name: 'title', type: 'text', labelKey: 'partLabelTitle', required: true, placeholderKey: 'partPlaceholderTitle' },
            {
              name: 'condition', type: 'chip-select', labelKey: 'partLabelCondition', defaultValue: 'USED',
              options: [
                { value: 'NEW', labelKey: 'partCondNew' },
                { value: 'USED', labelKey: 'partCondUsed' },
                { value: 'REFURBISHED', labelKey: 'partCondRefurb' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 1: Details ═══════ */
    {
      id: 'details',
      labelKey: 'partStepDetails',
      icon: 'info',
      sections: [
        {
          titleKey: 'partLabelDetailsSection',
          icon: 'info',
          fields: [
            { name: 'partNumber', type: 'text', labelKey: 'partLabelOEM', placeholderKey: 'partPlaceholderOptional' },
            { name: 'compatibleMakes', type: 'brands-multi-select', labelKey: 'partLabelBrands', hintKey: 'partHintMultiSelect' },
          ],
        },
        {
          titleKey: 'partLabelDetailsSection',
          icon: 'date_range',
          gridCols: 2,
          fields: [
            { name: 'yearFrom', type: 'number', labelKey: 'partLabelYearFrom', placeholderKey: 'partPlaceholder2015' },
            { name: 'yearTo', type: 'number', labelKey: 'partLabelYearTo', placeholderKey: 'partPlaceholder2023' },
          ],
        },
        {
          titleKey: '',
          fields: [
            { name: 'isOriginal', type: 'checkbox', labelKey: 'partLabelOriginal', defaultValue: false },
            { name: 'description', type: 'textarea', labelKey: 'partLabelDesc', placeholderKey: 'partPlaceholderDesc' },
          ],
        },
      ],
    },

    /* ═══════ Step 2: Price & Location ═══════ */
    {
      id: 'price',
      labelKey: 'partStepPrice',
      icon: 'sell',
      requiredFields: ['price'],
      sections: [
        {
          titleKey: 'partLabelPrice',
          icon: 'sell',
          fields: [
            { name: 'price', type: 'number', labelKey: 'partLabelPriceOMR', required: true, step: '0.01', placeholderKey: 'partPlaceholderPrice' },
            { name: 'isPriceNegotiable', type: 'checkbox', labelKey: 'partLabelNegotiable', defaultValue: false },
          ],
        },
        {
          titleKey: 'partLabelLocationContact',
          icon: 'location_on',
          fields: [
            { name: '_location', type: 'location', labelKey: 'partLabelLocationContact', showCountry: true, defaultCountry: 'OM' } as any,
          ],
        },
        {
          titleKey: 'partLabelContact',
          icon: 'call',
          gridCols: 2,
          fields: [
            { name: 'contactPhone', type: 'text', labelKey: 'partLabelPhone', placeholderKey: 'busPlaceholderPhone' },
            { name: 'whatsapp', type: 'text', labelKey: 'partLabelWhatsapp', placeholderKey: 'busPlaceholderPhone' },
          ],
        },
      ],
    },
  ],

  transformPayload: (data) => {
    const payload = { ...data };
    if (typeof payload.price === 'string') payload.price = parseFloat(payload.price as string);
    delete payload._location;
    return payload;
  },
};
