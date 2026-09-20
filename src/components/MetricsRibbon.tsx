import React from 'react';
import { 
  Zap, 
  Users, 
  ThermometerSnowflake, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MetricsRibbonProps {
  activeEmergenciesCount: number;
  totalDonorsAlerted: number;
}

export const MetricsRibbon: React.FC<MetricsRibbonProps> = ({
  activeEmergenciesCount,
  totalDonorsAlerted,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-900 border-y border-slate-800 text-white py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center">
              {activeEmergenciesCount}
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t('statActiveEmergencies')}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-emerald-400">
              3.8 {t('mins')}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t('statResponseSpeed')}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-sky-300">
              {totalDonorsAlerted}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t('statDonorsAlerted')}
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-cyan-300">
              100% Validated
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t('statColdChainSafe')}
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="col-span-2 md:col-span-1 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-amber-300">
              99.2%
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t('statFulfillmentRate')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
