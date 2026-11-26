// Compatibility exports used by the retained ID.3 component bundle.
// The product mounts as a normal React root inside the main site, without
// the original standalone router, document hydration, header or footer.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as JSX from 'react/jsx-runtime';
import * as productReactDOM from 'react-dom/client';
const i = value => value;
const n = () => ReactDOM;
const r = () => React;
const t = () => JSX;
export { i, n, r, t, productReactDOM };
