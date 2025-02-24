import { X } from "lucide-react";
import {
  Filter,
  FilterParameter,
  removeFilter,
  useStore,
} from "../../../../lib/store";
import { countries } from "countries-list";

function getParameterNameLabel(parameter: FilterParameter) {
  switch (parameter) {
    case "country":
      return "Country";
    case "device_type":
      return "Device Type";
    case "operating_system":
      return "Operating System";
    case "browser":
      return "Browser";
    case "referrer":
      return "Referrer";
    case "pathname":
      return "Pathname";
    default:
      return parameter;
  }
}

function getParameterValueLabel(filter: Filter) {
  switch (filter.parameter) {
    case "country":
      return (
        countries[filter.value as keyof typeof countries]?.name ?? filter.value
      );
    case "device_type":
      return filter.value;
    case "operating_system":
      return filter.value;
    case "browser":
      return filter.value;
    case "referrer":
      return filter.value;
    case "pathname":
      return filter.value;
    default:
      return filter.value;
  }
}

export function Filters() {
  const { filters } = useStore();
  if (filters.length === 0) return null;

  return (
    <div className="flex gap-2 mb-3">
      {filters.map((filter) => (
        <div
          key={filter.parameter}
          className="px-2 py-1 rounded-md bg-neutral-850 text-neutral-400 flex items-center gap-1 text-sm"
        >
          <div className="text-neutral-300">
            {getParameterNameLabel(filter.parameter)}
          </div>
          <div className="text-emerald-400 font-medium">is</div>
          <div className="text-neutral-100 font-medium">
            {getParameterValueLabel(filter)}
          </div>
          <div
            className="text-neutral-400 cursor-pointer hover:text-neutral-200"
            onClick={() => removeFilter(filter)}
          >
            <X size={16} strokeWidth={3} />
          </div>
        </div>
      ))}
    </div>
  );
}
