import React from 'react';

export default function Defer({
  children,
  timeout = 0,
  fallback = null,
}: {
  children: React.ReactNode;
  timeout?: number;
  fallback?: React.ReactNode;
}) {
  const [show, setShow] = React.useState(timeout === 0);
  React.useEffect(() => {
    if (timeout === 0) return;
    const id = setTimeout(() => setShow(true), timeout);
    return () => clearTimeout(id);
  }, [timeout]);
  return <>{show ? children : fallback}</>;
}

