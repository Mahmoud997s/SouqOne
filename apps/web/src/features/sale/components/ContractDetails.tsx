/**
 * Contract Details Section Component
 * Dedicated section for displaying contract information
 */

'use client';

import { memo } from 'react';
import { FileText, Users, Calendar, TrendingUp, Clock, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UnifiedListing } from '../types/unified.types';

interface ContractDetailsProps {
  listing: UnifiedListing;
}

export const ContractDetails = memo(function ContractDetails({ listing }: ContractDetailsProps) {
  const t = useTranslations('sale');
  const tc = useTranslations('common');

  // Helper to get translated contract type
  const getContractTypeLabel = (type: string | undefined): string => {
    if (!type) return t('contractTypeOther');
    const typeMap: Record<string, string> = {
      'SCHOOL': 'contractTypeSchool',
      'COMPANY': 'contractTypeCompany',
      'GOVERNMENT': 'contractTypeGovernment',
      'TOURISM': 'contractTypeTourism',
      'OTHER_CONTRACT': 'contractTypeOther',
    };
    return t(typeMap[type] || 'contractTypeOther');
  };

  // Only show for bus listings with contract data
  if (listing.type !== 'bus' || !listing.busData?.contractType) {
    return null;
  }

  const { busData } = listing;

  const notSpecified = tc('unspecified') || '—';
  const currency = tc('currencyOMR') || 'OMR';

  const contractDetails = [
    {
      icon: FileText,
      label: t('specContractType'),
      value: getContractTypeLabel(busData.contractType),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: t('specContractClient'),
      value: busData.contractClient || notSpecified,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Calendar,
      label: t('specContractDuration'),
      value: busData.contractDuration
        ? t('highlightContractDuration', { months: busData.contractDuration })
        : notSpecified,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: t('specProfitMargin'),
      value: busData.profitMargin
        ? t('highlightProfitMargin', { margin: busData.profitMargin })
        : notSpecified,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const monthlyDetails = [
    {
      icon: Building2,
      label: t('contractMonthlyValue'),
      value: busData.contractMonthly
        ? `${busData.contractMonthly} ${currency}`
        : notSpecified,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Clock,
      label: t('contractExpiryDate'),
      value: busData.contractExpiry
        ? new Date(busData.contractExpiry).toLocaleDateString('ar-OM')
        : notSpecified,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t('contractDetailsTitle')}</h3>
          <p className="text-sm text-slate-600">{t('contractDetailsSubtitle')}</p>
        </div>
      </div>

      {/* Main Contract Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {contractDetails.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`w-10 h-10 rounded-lg ${detail.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${detail.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1">{detail.label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{detail.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthlyDetails.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/70 border border-slate-200/70 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`w-10 h-10 rounded-lg ${detail.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${detail.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1">{detail.label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{detail.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact for Details */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{t('contractContactNote')}</p>
            <p className="text-xs text-blue-700">{t('contractContactSeller')}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
