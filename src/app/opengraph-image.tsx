import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = 'jouwhockeystick.nl — vind de hockeystick die bij je past';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Shared social preview image; brand colours only, no product or claim. */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        background: '#064e3b',
        color: '#ffffff',
      }}
    >
      <div style={{ fontSize: 40, color: '#a7f3d0' }}>{SITE_NAME}</div>
      <div
        style={{
          marginTop: 24,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        Vind de hockeystick die bij je past
      </div>
      <div style={{ marginTop: 32, fontSize: 34, color: '#d1fae5' }}>
        Stickwijzer met redenen, afweging en bronnen per stick
      </div>
    </div>,
    size,
  );
}
