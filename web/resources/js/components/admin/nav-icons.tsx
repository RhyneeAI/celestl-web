// Inline nav icons ported 1:1 from design/admin-dashboard.html's sidebar <svg> markup.
import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            {...props}
        />
    );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
        </Icon>
    );
}

export function PacksIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
            <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </Icon>
    );
}

export function SongsIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M9 18V5l12-2v13" />
            <circle cx={6} cy={18} r={3} />
            <circle cx={18} cy={16} r={3} />
        </Icon>
    );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx={9} cy={8} r={3.2} />
            <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
            <circle cx={18} cy={8} r={2.4} />
            <path d="M15.5 14.8c2.5.4 4.5 2.3 4.5 5.2" />
        </Icon>
    );
}

export function GamesIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <rect x={3} y={7} width={18} height={12} rx={3} />
            <circle cx={8.5} cy={13} r={1.6} />
            <path d="M14.5 12h3M14.5 14.5h2" />
        </Icon>
    );
}

export function LogIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <circle cx={12} cy={12} r={8.5} />
            <path d="M12 7.5V12l3 2" />
        </Icon>
    );
}

export function ImportIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
        </Icon>
    );
}

export function TestingIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <Icon {...props}>
            <rect x={4} y={4} width={16} height={16} rx={3} />
            <path d="M9 14l2.5-3 2 2.2L16 10l3 4" />
        </Icon>
    );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            {...props}
        >
            <circle cx={11} cy={11} r={7} />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}
