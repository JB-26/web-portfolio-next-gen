import { parseISO, format } from 'date-fns';

// `short` renders "Mar 26, 2026" for the redesign's mono metadata lines.
// The default stays "March 26, 2026" so pages not yet redesigned — and the
// tests asserting on them — are unaffected.
export default function Date({ dateString, short = false }) {
    const date = parseISO(dateString);
    return (
        <time dateTime={dateString}>
            {format(date, short ? 'LLL d, yyyy' : 'LLLL d, yyyy')}
        </time>
    );
}
