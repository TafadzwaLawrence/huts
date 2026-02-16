import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'info'
  const message = searchParams.get('message') || 'Action completed'

  const bgColor = type === 'success' ? '#51CF66' : type === 'error' ? '#FF6B6B' : '#495057'
  const icon = type === 'success' ? '&#10003;' : type === 'error' ? '&#10007;' : '&#8505;'

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Property Verification - Huts</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          border: 1px solid #e9ecef;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: ${bgColor};
          color: white;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .logo {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #adb5bd;
          margin-bottom: 32px;
        }
        h1 {
          color: #212529;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        p {
          color: #495057;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 32px;
        }
        .btn {
          display: inline-block;
          background: #212529;
          color: white;
          padding: 12px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }
        .btn:hover { background: #000; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">HUTS</div>
        <div class="icon">${icon}</div>
        <h1>${type === 'success' ? 'Done!' : type === 'error' ? 'Error' : 'Info'}</h1>
        <p>${message}</p>
        <a href="/" class="btn">Go to Huts</a>
      </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
