import { EntryModeInput } from './EntryModeInput';
import type { StepProps } from './StepProps';

export function StepEntries({ draft, update }: StepProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Deelnemers</h2>
      <EntryModeInput draft={draft} update={update} />
    </div>
  );
}
