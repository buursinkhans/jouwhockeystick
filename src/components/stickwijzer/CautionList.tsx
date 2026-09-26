import { CAUTION_LABELS } from '@/advice-engine/cautions';
import type { CautionCode } from '@/advice-engine/types';
import { AlertIcon } from '@/components/ui/icons';

export function CautionList({ cautions }: { cautions: CautionCode[] }) {
  if (cautions.length === 0) {
    return null;
  }
  return (
    <ul className="mt-2 space-y-1.5">
      {cautions.map((code) => (
        <li key={code} className="flex items-start gap-1.5 text-sm text-amber-800">
          <AlertIcon size={14} className="mt-0.5 shrink-0" />
          <span>{CAUTION_LABELS[code]}</span>
        </li>
      ))}
    </ul>
  );
}
