import type { StepProps } from './StepProps';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';

export function StepResources({ draft, update }: StepProps) {
  function setResourceName(index: number, name: string) {
    const resourceNames = draft.resourceNames.map((n, i) => (i === index ? name : n));
    update({ resourceNames });
  }

  function removeResource(index: number) {
    update({ resourceNames: draft.resourceNames.filter((_, i) => i !== index) });
  }

  function addResource() {
    update({ resourceNames: [...draft.resourceNames, `Veld ${draft.resourceNames.length + 1}`] });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Velden</h2>
      <div className="space-y-2">
        {draft.resourceNames.map((name, index) => (
          <div key={index} className="flex gap-2">
            <input className={inputClass} value={name} onChange={(e) => setResourceName(index, e.target.value)} />
            <button
              type="button"
              onClick={() => removeResource(index)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              aria-label={`Verwijder ${name || 'veld'}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addResource} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        + Veld toevoegen
      </button>
    </div>
  );
}
