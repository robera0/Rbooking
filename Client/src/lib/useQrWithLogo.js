import { useEffect, useState } from "react";
import { qrWithLogoOrOriginal } from "./qrLogo.js";

// The QR image with the Paysso logo in the middle. Shows the plain QR until
// the logo version is ready.
export const useQrWithLogo = (qrSrc) => {
  const [composed, setComposed] = useState({ from: null, result: null });

  useEffect(() => {
    if (!qrSrc) return undefined;
    let cancelled = false;
    qrWithLogoOrOriginal(qrSrc).then((result) => {
      if (!cancelled) setComposed({ from: qrSrc, result });
    });
    return () => {
      cancelled = true;
    };
  }, [qrSrc]);

  return composed.from === qrSrc && composed.result ? composed.result : qrSrc;
};
