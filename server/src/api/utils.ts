import { ResultSet } from "@clickhouse/client";
import { Filter, FilterParameter, FilterType } from "./types.js";

export function getTimeStatement(
  startDate: string,
  endDate: string,
  timezone: string
) {
  if (!startDate && !endDate) {
    return "";
  }
  return `AND timestamp >= toTimeZone(
      toStartOfDay(toDateTime('${startDate}', '${timezone}')),
      'UTC'
    )
    AND timestamp < if(
      toDate('${endDate}') = toDate(now(), '${timezone}'),
      now(),
      toTimeZone(
        toStartOfDay(toDateTime('${endDate}', '${timezone}')) + INTERVAL 1 DAY,
        'UTC'
      )
    )`;
}

export async function processResults<T>(
  results: ResultSet<"JSONEachRow">
): Promise<T[]> {
  const data: T[] = await results.json();
  for (const row of data) {
    for (const key in row) {
      if (!isNaN(Number(row[key]))) {
        row[key] = Number(row[key]) as any;
      }
    }
  }
  return data;
}

const filterTypeToOperator = (type: FilterType) => {
  switch (type) {
    case "equals":
      return "=";
    case "not_equals":
      return "!=";
    case "contains":
      return "LIKE";
    case "not_contains":
      return "NOT LIKE";
  }
};

export const geSqlParam = (parameter: FilterParameter) => {
  if (parameter === "referrer") {
    return "domainWithoutWWW(referrer)";
  }
  return parameter;
};

export function getFilterStatement(filters: string) {
  const filtersArray = JSON.parse(filters);
  if (filtersArray.length === 0) {
    return "";
  }
  return (
    "AND " +
    filtersArray
      .map((filter: Filter) => {
        return `${geSqlParam(filter.parameter)} ${filterTypeToOperator(
          filter.type
        )} '${filter.value}'`;
      })
      .join(" AND ")
  );
}
