/** Search box inside a document list tab. Not the workspace filter field `search`. */
export const DOC_TAB_SEARCH_QUERY_KEY = 'tabSearch';

export function readDocTabSearch(params: {
  get(name: string): string | null;
}): string {
  return params.get(DOC_TAB_SEARCH_QUERY_KEY)?.trim() ?? '';
}
