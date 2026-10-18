// Two levels: root links/groups, then links inside a group.
export function locate(navigation, key) {
  for (let index = 0; index < navigation.length; index++) {
    const item = navigation[index];
    if (item.key === key) return {item, array: navigation, index, parent: null};
    if (item.type !== 'group') continue;
    const childIndex = (item.children || []).findIndex(child => child.key === key);
    if (childIndex >= 0) return {item: item.children[childIndex], array: item.children, index: childIndex, parent: item};
  }
  return null;
}
export function moveItem(navigation, key, parentKey = null, beforeKey = null) {
  const source = locate(navigation, key);
  const parent = parentKey == null ? null : navigation.find(item => item.key === parentKey && item.type === 'group');
  if (!source || (parentKey != null && !parent) || (source.item.type === 'group' && parent)) return false;
  const destination = parent ? (parent.children || []) : navigation;
  if (beforeKey === key && source.array === destination) return false;
  if (beforeKey != null && !destination.some(item => item.key === beforeKey)) return false;
  const originalIndex = source.index;
  if (source.array === destination) {
    const index = beforeKey == null ? destination.length : destination.findIndex(item => item.key === beforeKey);
    if (index === originalIndex || index === originalIndex + 1) return false;
  }
  source.array.splice(source.index, 1);
  const index = beforeKey == null ? destination.length : destination.findIndex(item => item.key === beforeKey);
  destination.splice(index, 0, source.item);
  if (parent) parent.children = destination;
  return true;
}
