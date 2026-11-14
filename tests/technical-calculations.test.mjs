import test from 'node:test';import assert from 'node:assert/strict';
import {occupancyRate,teamHours,workloadEstimate,administrativeCompletion} from '../src/technical-calculations.ts';
test('occupation of 8 of 10 is 80%',()=>assert.equal(occupancyRate(8,10),80));
test('occupancy rejects exceeding capacity',()=>assert.throws(()=>occupancyRate(11,10)));
test('team hours reflect three factors',()=>assert.equal(teamHours(4,6,5),120));
test('estimated workload equivalents',()=>assert.equal(workloadEstimate(1200,30,600),1));
test('completion proportion',()=>assert.equal(administrativeCompletion(20,80),25));
test('zero denominator rejected',()=>assert.throws(()=>administrativeCompletion(2,0)));
test('negative volume rejected',()=>assert.throws(()=>workloadEstimate(-1,30,600)));
