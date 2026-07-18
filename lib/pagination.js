/**
 * Build the list of page numbers to render in the pagination control.
 *
 * The design handoff shows only two pages, so it never specifies what happens
 * when there are many. This site has ~29 pages, where rendering every number
 * is unusable, so the list is windowed: always the first and last page, plus
 * `span` pages either side of the current one. Gaps are represented by `null`
 * and render as an ellipsis.
 *
 * buildPageList(1, 29)  -> [1, 2, null, 29]
 * buildPageList(15, 29) -> [1, null, 14, 15, 16, null, 29]
 * buildPageList(3, 4)   -> [1, 2, 3, 4]
 */
export function buildPageList(currentPage, numPages, span = 1) {
    if (!Number.isFinite(numPages) || numPages < 1) return [];
    if (numPages === 1) return [1];

    const shown = new Set([1, numPages]);
    for (let page = currentPage - span; page <= currentPage + span; page++) {
        if (page >= 1 && page <= numPages) shown.add(page);
    }

    const ordered = [...shown].sort((a, b) => a - b);
    const out = [];
    let previous = 0;

    for (const page of ordered) {
        // Only insert a gap marker when more than one page is being skipped;
        // a single skipped page is rendered rather than hidden behind an
        // ellipsis that would take the same space.
        if (previous && page - previous > 1) {
            if (page - previous === 2) {
                out.push(previous + 1);
            } else {
                out.push(null);
            }
        }
        out.push(page);
        previous = page;
    }

    return out;
}
