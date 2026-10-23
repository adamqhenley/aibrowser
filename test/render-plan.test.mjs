import {test} from 'node:test';import assert from 'node:assert/strict';import {validatePlan} from '../render-plan.mjs';
const doc={blocks:[{id:'a'},{id:'b'}]};const plan=()=>({layout:'cards',theme:'dark',density:'compact',order:['b','a'],explanation:'Records first.'});
test('accepts ordering without changing publisher content',()=>assert.deepEqual(validatePlan(plan(),doc).order,['b','a']));
test('rejects omitted, duplicate, and invented source blocks',()=>{for(const order of [['a'],['a','a'],['a','x']])assert.throws(()=>validatePlan({...plan(),order},doc));});
test('rejects arbitrary code and unsupported style choices',()=>{assert.throws(()=>validatePlan({...plan(),script:'evil()'},doc));assert.throws(()=>validatePlan({...plan(),theme:'url(evil)'},doc));});
