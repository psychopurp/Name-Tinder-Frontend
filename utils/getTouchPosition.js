export default function getTouchPosition(e) {
  return {
    x: e.changedTouches[0].clientX - e.currentTarget.offsetLeft,
    y: e.changedTouches[0].clientY - e.currentTarget.offsetTop
  };
}
