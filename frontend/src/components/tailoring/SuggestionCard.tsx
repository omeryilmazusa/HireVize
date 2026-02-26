export interface Suggestion {
  section: string;
  original: string;
  suggested: string;
  rationale: string;
}

export function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h4 className="mb-2 text-sm font-semibold capitalize text-gray-700">
        {suggestion.section}
      </h4>
      <div className="mb-2 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">Original</p>
          <p className="text-gray-600 line-through">{suggestion.original}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-green-500">Suggested</p>
          <p className="text-gray-900">{suggestion.suggested}</p>
        </div>
      </div>
      <p className="mb-3 text-xs italic text-gray-400">
        {suggestion.rationale}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="rounded bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
