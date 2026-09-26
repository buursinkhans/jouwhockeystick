import { REASON_CODE_LABELS } from '@/advice-engine/reasonCodes';
import type { ReasonCode } from '@/advice-engine/types';

export function ReasonList({ reasonCodes }: { reasonCodes: ReasonCode[] }) {
  return (
    <ul className="mt-2 space-y-1 text-sm text-zinc-700">
      {reasonCodes.map((code) => (
        <li key={code} className="flex gap-2">
          <span aria-hidden="true">✓</span>
          <span>{REASON_CODE_LABELS[code]}</span>
        </li>
      ))}
    </ul>
  );
}
