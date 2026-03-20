export function getByPath(obj, path, fallback = undefined) {
  if (!obj || !path) return fallback;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return fallback;
  }
  return cur;
}
