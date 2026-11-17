import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'content-encoding',
  'host',
]);

function resolveBackendBaseUrl(): string {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';
  return raw.replace(/\/+$/, '');
}

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<NextResponse> {
  const resolvedParams = await context.params;
  const segments = resolvedParams.path ?? [];

  if (
    segments.some(
      (seg) => !seg || seg === '.' || seg === '..' || seg.includes('\\') || seg.includes('://'),
    )
  ) {
    return NextResponse.json(
      { success: false, message: 'مسیر درخواست نامعتبر است.' },
      { status: 400 },
    );
  }

  const targetUrl = `${resolveBackendBaseUrl()}/api/v1/${segments.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;

  const forwardHeaders = new Headers();
  const allowedForwardKeys = [
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'cookie',
    'user-agent',
    'x-requested-with',
  ];

  for (const key of allowedForwardKeys) {
    const val = req.headers.get(key);
    if (val) {
      forwardHeaders.set(key, val);
    }
  }

  const originHeader = req.headers.get('origin');
  const refererHeader = req.headers.get('referer');
  if (originHeader) forwardHeaders.set('origin', originHeader);
  if (refererHeader) forwardHeaders.set('referer', refererHeader);

  const rawRealIp = req.headers.get('x-real-ip')?.trim();
  const forwardedChain = (req.headers.get('x-forwarded-for') || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const candidateIp =
    rawRealIp || (forwardedChain.length > 0 ? forwardedChain[forwardedChain.length - 1] : '') || '127.0.0.1';
  const safeIp = /^[\da-fA-F.:]{3,45}$/.test(candidateIp) ? candidateIp : '127.0.0.1';
  forwardHeaders.set('x-forwarded-for', safeIp);

  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
  const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body: bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    const outHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lower) && lower !== 'set-cookie') {
        outHeaders.set(key, value);
      }
    });

    const headerBag = upstream.headers as unknown as {
      getSetCookie?: () => string[];
    };
    const setCookies =
      typeof headerBag.getSetCookie === 'function'
        ? headerBag.getSetCookie()
        : upstream.headers.get('set-cookie')
          ? [upstream.headers.get('set-cookie') as string]
          : [];

    for (const cookieStr of setCookies) {
      outHeaders.append('set-cookie', cookieStr);
    }

    const resBuffer = await upstream.arrayBuffer();
    return new NextResponse(resBuffer, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'ارتباط موقت با سرور مرکزی تهاتر آپ برقرار نشد. لطفاً لحظاتی دیگر تلاش کنید.',
      },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}

export async function OPTIONS(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, context);
}
