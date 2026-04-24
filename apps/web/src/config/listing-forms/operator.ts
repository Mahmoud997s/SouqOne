import type { FormConfig } from '@/types/form-config';

export const operatorFormConfig: FormConfig = {
  type: 'operator',
  titleKey: 'opTitle',
  submitKey: 'opSubmit',
  apiEndpoint: '/operators',
  redirectPath: (id) => `/equipment/operators/${id}`,
  createHook: 'useCreateOperatorListing',
  fetchHook: 'useOperatorListing',
  updateHook: 'useUpdateOperatorListing',

  steps: [
    /* ═══════ Step 0: Operator Type ═══════ */
    {
      id: 'type',
      labelKey: 'opStepType',
      icon: 'engineering',
      requiredFields: ['operatorType'],
      sections: [
        {
          titleKey: 'opLabelServiceType',
          icon: 'engineering',
          fields: [
            {
              name: 'operatorType',
              type: 'card-select',
              labelKey: 'opLabelServiceType',
              required: true,
              columns: 2,
              options: [
                { value: 'DRIVER', labelKey: 'opTypeDriver', icon: 'drive_eta', descKey: 'opTypeDriverDesc' },
                { value: 'OPERATOR', labelKey: 'opTypeOperator', icon: 'precision_manufacturing', descKey: 'opTypeOperatorDesc' },
                { value: 'TECHNICIAN', labelKey: 'opTypeTechnician', icon: 'build', descKey: 'opTypeTechnicianDesc' },
                { value: 'MAINTENANCE', labelKey: 'opTypeMaintenance', icon: 'handyman', descKey: 'opTypeMaintenanceDesc' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 1: Info ═══════ */
    {
      id: 'info',
      labelKey: 'opStepInfo',
      icon: 'description',
      requiredFields: ['title', 'description'],
      sections: [
        {
          titleKey: 'opLabelBasicInfo',
          icon: 'description',
          fields: [
            { name: 'title', type: 'text', labelKey: 'opLabelTitle', required: true, placeholderKey: 'opPlaceholderTitle' },
            { name: 'description', type: 'textarea', labelKey: 'opLabelDesc', required: true, placeholderKey: 'opPlaceholderDesc' },
          ],
        },
        {
          titleKey: 'opLabelExperienceSection',
          icon: 'work',
          gridCols: 2,
          fields: [
            { name: 'experienceYears', type: 'number', labelKey: 'opLabelExperience', placeholderKey: 'opPlaceholder10' },
            { name: 'specializations', type: 'text', labelKey: 'opLabelSpecializations', placeholderKey: 'opPlaceholderSpec' },
            { name: 'certifications', type: 'text', labelKey: 'opLabelCerts', placeholderKey: 'opPlaceholderCerts', colSpan: 2 },
          ],
        },
        {
          titleKey: 'opLabelEquipTypes',
          icon: 'precision_manufacturing',
          fields: [
            {
              name: 'equipmentTypes',
              type: 'multi-chip',
              labelKey: 'opLabelEquipTypes',
              defaultValue: [],
              options: [
                { value: 'EXCAVATOR', labelKey: 'opExcavator' },
                { value: 'CRANE', labelKey: 'opCrane' },
                { value: 'LOADER', labelKey: 'opLoader' },
                { value: 'BULLDOZER', labelKey: 'opBulldozer' },
                { value: 'FORKLIFT', labelKey: 'opForklift' },
                { value: 'CONCRETE_MIXER', labelKey: 'opConcreteMixer' },
                { value: 'GENERATOR', labelKey: 'opGenerator' },
                { value: 'COMPRESSOR', labelKey: 'opCompressor' },
                { value: 'TRUCK', labelKey: 'opTruck' },
                { value: 'DUMP_TRUCK', labelKey: 'opDumpTruck' },
                { value: 'WATER_TANKER', labelKey: 'opWaterTanker' },
                { value: 'LIGHT_EQUIPMENT', labelKey: 'opLightEquip' },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════ Step 2: Price & Location ═══════ */
    {
      id: 'price',
      labelKey: 'opStepPrice',
      icon: 'payments',
      sections: [
        {
          titleKey: 'opLabelPrices',
          icon: 'payments',
          gridCols: 2,
          fields: [
            { name: 'dailyRate', type: 'number', labelKey: 'opLabelDailyRate' },
            { name: 'hourlyRate', type: 'number', labelKey: 'opLabelHourlyRate' },
          ],
        },
        {
          titleKey: '',
          fields: [
            { name: 'isPriceNegotiable', type: 'checkbox', labelKey: 'opLabelNegotiable', defaultValue: false },
          ],
        },
        {
          titleKey: 'opLabelLocationContact',
          icon: 'location_on',
          fields: [
            { name: '_location', type: 'location', labelKey: 'opLabelLocationContact', showCountry: false, defaultCountry: 'OM' } as any,
          ],
        },
        {
          titleKey: 'opLabelContact',
          icon: 'call',
          gridCols: 2,
          fields: [
            { name: 'contactPhone', type: 'text', labelKey: 'opLabelPhone', placeholderKey: 'busPlaceholderPhone' },
            { name: 'whatsapp', type: 'text', labelKey: 'opLabelWhatsapp', placeholderKey: 'busPlaceholderPhone' },
          ],
        },
      ],
    },
  ],

  transformPayload: (data) => {
    const payload = { ...data };
    // Convert comma-separated strings to arrays
    if (typeof payload.specializations === 'string') {
      payload.specializations = (payload.specializations as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof payload.certifications === 'string') {
      payload.certifications = (payload.certifications as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    delete payload._location;
    return payload;
  },
};
