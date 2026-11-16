// The Paysso logo with its name, for places where it is shown on screen
// (the posters are drawn on a canvas by src/lib/brand.js with the same look).
const BrandMark = ({ height = "1.75rem", className = "", style }) => (
  <span
    className={`inline-flex items-center ${className}`}
    style={{ gap: `calc(${height} * 0.25)`, ...style }}
  >
    <img src="/P_logo.png" alt="" style={{ height }} className="w-auto" />
    <span
      className="text-white"
      style={{
        fontFamily: 'Poppins, "Helvetica Neue", Arial, sans-serif',
        fontWeight: 800,
        fontSize: `calc(${height} * 0.72)`,
        lineHeight: 1,
      }}
    >
      PAY<span style={{ color: "#FF7A00" }}>SSO</span>
    </span>
  </span>
);

export default BrandMark;
