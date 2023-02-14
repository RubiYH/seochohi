// media query 값
const value = {
  PC: {
    width: "1024px",
    attr: "min-width",
  },
  Mobile: {
    width: "768px",
    attr: "max-width",
  },
  Tablet: {
    width: "615px",
    attr: "max-width",
  },
  Tiny: {
    width: "364px",
    attr: "max-width",
  },
  Setting: {
    width: "615px",
    attr: "max-width",
  },
};

// media query 리턴 함수
export function MediaQuery(type) {
  return `(${value[type].attr}: ${value[type].width})`;
}
