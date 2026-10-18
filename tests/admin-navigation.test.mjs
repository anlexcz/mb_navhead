import test from 'node:test';
import assert from 'node:assert/strict';
import {locate, moveItem} from '../navhead/admin/admin-navigation.mjs';
const link = key => ({key, type:'link', label:key, url:'https://example.org/' + key, target:'_blank'});
const fixture = () => [link('a'), {key:'g', type:'group', children:[link('b'),link('c')]}, link('d'), {key:'h', type:'group', children:[]}];
const keys = array => array.map(item => item.key);
test('reorder root links before and after a group', () => {
  const nav=fixture(); assert(moveItem(nav,'d',null,'g')); assert.deepEqual(keys(nav),['a','d','g','h']);
  assert(moveItem(nav,'a',null,'h')); assert.deepEqual(keys(nav),['d','g','a','h']);
});
test('append last item without losing any item', () => {
  const nav=fixture(); assert(moveItem(nav,'a')); assert.deepEqual(keys(nav),['g','d','h','a']); assert.equal(moveItem(nav,'a'),false);
});
test('move root link into an empty group', () => {
  const nav=fixture(), item=nav[0]; assert(moveItem(nav,'a','h')); assert.deepEqual(keys(nav),['g','d','h']); assert.strictEqual(locate(nav,'a').item,item); assert.equal(locate(nav,'a').parent.key,'h'); assert.equal(item.target,'_blank');
});
test('move link between groups and back into a specific position', () => {
  const nav=fixture(); assert(moveItem(nav,'b','h')); assert.deepEqual(keys(locate(nav,'g').item.children),['c']); assert(moveItem(nav,'b','g','c')); assert.deepEqual(keys(locate(nav,'g').item.children),['b','c']); assert.deepEqual(locate(nav,'h').item.children,[]);
});
test('move child out to root before its old parent', () => {
  const nav=fixture(); assert(moveItem(nav,'b',null,'g')); assert.deepEqual(keys(nav),['a','b','g','d','h']); assert.deepEqual(keys(locate(nav,'g').item.children),['c']); assert.equal(locate(nav,'b').parent,null);
});
test('move child within a group in both directions', () => {
  const nav=fixture(); assert(moveItem(nav,'b','g')); assert.deepEqual(keys(locate(nav,'g').item.children),['c','b']); assert(moveItem(nav,'b','g','c')); assert.deepEqual(keys(locate(nav,'g').item.children),['b','c']);
});
test('moving a group preserves all children', () => {
  const nav=fixture(), group=nav[1], children=group.children; assert(moveItem(nav,'g',null,'a')); assert.strictEqual(nav[0],group); assert.strictEqual(nav[0].children,children); assert.deepEqual(keys(children),['b','c']);
});
test('reject nested groups, including a group inside itself', () => {
  const nav=fixture(), original=structuredClone(nav); assert.equal(moveItem(nav,'g','h'),false); assert.equal(moveItem(nav,'g','g'),false); assert.deepEqual(nav,original);
});
test('invalid destinations leave the tree unchanged', () => {
  for (const args of [['missing',null],['b','missing'],['b','a'],['b','h','c']]) {const nav=fixture(), original=structuredClone(nav); assert.equal(moveItem(nav,...args),false); assert.deepEqual(nav,original);}
});
test('dropping on itself or at its current position is a no-op', () => {
  const nav=fixture(), original=structuredClone(nav); assert.equal(moveItem(nav,'a',null,'a'),false); assert.equal(moveItem(nav,'a',null,'g'),false); assert.equal(moveItem(nav,'b','g','c'),false); assert.deepEqual(nav,original);
});
test('group without a children array accepts its first link', () => {
  const nav=[link('a'),{key:'g',type:'group'}]; assert(moveItem(nav,'a','g')); assert.deepEqual(keys(nav),['g']); assert.deepEqual(keys(nav[0].children),['a']);
});
