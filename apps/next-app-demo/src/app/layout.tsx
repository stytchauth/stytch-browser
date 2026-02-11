import './globals.css';

import { StytchContext } from '@/app/StytchContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StytchContext>{children}</StytchContext>
      </body>
    </html>
  );
}
