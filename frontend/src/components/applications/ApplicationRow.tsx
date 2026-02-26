import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { Application } from "@/types/application";

export function ApplicationRow({ application }: { application: Application }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">
        {/* TODO: show company name from joined job */}
        --
      </td>
      <td className="px-4 py-3 text-gray-600">
        {/* TODO: show job title from joined job */}
        --
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>
      <td className="px-4 py-3 text-gray-500">
        {new Date(application.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/applications/${application.id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
