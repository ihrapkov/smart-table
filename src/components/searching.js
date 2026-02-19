import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
  // @todo: #5.1 — настроить компаратор
  const compareWithSearch = createComparison(
    ["skipEmptyTargetValues"],
    [
      rules.searchMultipleFields(
        searchField,
        ["date", "customer", "seller"],
        false,
      ),
    ],
  );

  return (data, state, action) => {
    // @todo: #5.2 — применить компаратор
    return data.filter((item) =>
      compareWithSearch(item, {
        [searchField]: state[searchField],
      }),
    );
  };
}
