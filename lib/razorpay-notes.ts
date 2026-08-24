// Razorpay notes packing — carries every browser-side signal through to
// the server-to-server webhook, where cookies and headers are no longer
// available. Razorpay caps `notes` at 15 key-value pairs, 256 chars per
// value; the 15 slots below cover every field the Pabbly payload needs,
// with defensive truncation on the few strings that can legitimately
// exceed 256 (UA, referrer, landing_path, fbc, fbclid).
//
// The `kind` sentinel scopes this funnel's payments so a shared
// Razorpay account can filter webhook noise from unrelated payments.

export const KIND = 'sdp_funnel';
export const MAX_NOTE_LEN = 256;

const trunc = (s: string, n: number = MAX_NOTE_LEN): string => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) : s;
};

export interface NotePayload {
  cust: {
    fn: string; ln: string; em: string; ph: string;
    ct: string; co: string; dl: string;
  };
  utm: {
    s: string; m: string; c: string; n: string; t: string; id: string;
  };
  fbclid: string;
  oclids: { g: string; m: string; t: string; l: string };
  fbc: string;
  fbp: string;
  ip: string;
  ua: string;
  esu: string;
  rf: string;
  lp: string;
  fs: string;
  cpn: string;
  pv: string;
}

/** Pack the browser-side signal payload into a 15-key notes object. */
export function packNotes(p: NotePayload): Record<string, string> {
  return {
    kind:   KIND,
    cust:   trunc(JSON.stringify(p.cust)),
    utm:    trunc(JSON.stringify(p.utm)),
    fbclid: trunc(p.fbclid),
    oclids: trunc(JSON.stringify(p.oclids)),
    fbc:    trunc(p.fbc),
    fbp:    trunc(p.fbp),
    ip:     trunc(p.ip, 45),
    ua:     trunc(p.ua),
    esu:    trunc(p.esu),
    rf:     trunc(p.rf),
    lp:     trunc(p.lp),
    fs:     trunc(p.fs),
    cpn:    trunc(p.cpn),
    pv:     trunc(p.pv),
  };
}

export interface UnpackedNotes {
  kind: string;
  cust: { fn: string; ln: string; em: string; ph: string; ct: string; co: string; dl: string };
  utm: { s: string; m: string; c: string; n: string; t: string; id: string };
  fbclid: string;
  oclids: { g: string; m: string; t: string; l: string };
  fbc: string;
  fbp: string;
  ip: string;
  ua: string;
  esu: string;
  rf: string;
  lp: string;
  fs: string;
  cpn: string;
  pv: string;
}

const EMPTY_CUST = { fn: '', ln: '', em: '', ph: '', ct: '', co: '', dl: '' };
const EMPTY_UTM = { s: '', m: '', c: '', n: '', t: '', id: '' };
const EMPTY_OCLIDS = { g: '', m: '', t: '', l: '' };

function safeJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...fallback, ...parsed };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Unpack the notes object from a Razorpay webhook payment entity. */
export function unpackNotes(notes: Record<string, unknown> | undefined | null): UnpackedNotes {
  const n = notes ?? {};
  const get = (k: string) => (typeof n[k] === 'string' ? (n[k] as string) : '');
  return {
    kind:   get('kind'),
    cust:   safeJson(n.cust, EMPTY_CUST),
    utm:    safeJson(n.utm, EMPTY_UTM),
    fbclid: get('fbclid'),
    oclids: safeJson(n.oclids, EMPTY_OCLIDS),
    fbc:    get('fbc'),
    fbp:    get('fbp'),
    ip:     get('ip'),
    ua:     get('ua'),
    esu:    get('esu'),
    rf:     get('rf'),
    lp:     get('lp'),
    fs:     get('fs'),
    cpn:    get('cpn'),
    pv:     get('pv'),
  };
}
