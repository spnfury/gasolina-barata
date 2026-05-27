import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SCANNER_PATTERNS = [
    /\.env(\.|$)/i,
    /\.php(\.|$)/i,
    /\.git(\/|$)/i,
    /wp-admin/i,
    /wp-login/i,
    /\.aspx?$/i,
];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (SCANNER_PATTERNS.some((re) => re.test(pathname))) {
        return new NextResponse('Gone', {
            status: 410,
            headers: { 'X-Robots-Tag': 'noindex, nofollow' },
        });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|robots.txt|sitemap.xml).*)'],
};
