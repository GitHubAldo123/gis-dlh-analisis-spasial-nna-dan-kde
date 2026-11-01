import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUtmZone,
  projectWgs84ToUtm,
  planarDistance,
  computeNNA,
  erf,
  normalCdf
} from './spatialMath';
import { EnvironmentalObject } from '../types/gis';

test('getUtmZone calculates correct UTM zone and EPSG for Indonesia', () => {
  // Bandung / Jakarta (~107°E, -6.9°S) -> Zone 48 South -> EPSG 32748
  const res = getUtmZone(107.6098, -6.9147);
  assert.equal(res.zone, 48);
  assert.equal(res.isSouth, true);
  assert.equal(res.epsg, 32748);

  // Surabaya (~112.7°E, -7.2°S) -> Zone 49 South -> EPSG 32749
  const sby = getUtmZone(112.7521, -7.2575);
  assert.equal(sby.zone, 49);
  assert.equal(sby.isSouth, true);
  assert.equal(sby.epsg, 32749);
});

test('projectWgs84ToUtm produces reasonable metric coordinates', () => {
  const p1 = projectWgs84ToUtm(107.60, -6.91);
  const p2 = projectWgs84ToUtm(107.61, -6.91);

  // 0.01 degree lon at latitude -6.9 is roughly 1,105 meters
  const dist = planarDistance(p1.x, p1.y, p2.x, p2.y);
  assert.ok(dist > 1050 && dist < 1150, `Distance was ${dist}, expected ~1105m`);
});

test('erf and normalCdf approximate standard normal distribution accurately', () => {
  // normalCdf(0) should be 0.5
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 0.001);
  // normalCdf(1.96) should be ~0.975
  assert.ok(Math.abs(normalCdf(1.96) - 0.975) < 0.005);
  // normalCdf(-1.96) should be ~0.025
  assert.ok(Math.abs(normalCdf(-1.96) - 0.025) < 0.005);
});

test('computeNNA throws when fewer than 4 points are provided', () => {
  const dummy: EnvironmentalObject[] = [
    {
      id: '1',
      name: 'P1',
      category: 'Bank Sampah',
      address: '',
      regency: 'Bandung',
      district: 'Andir',
      village: '',
      latitude: -6.91,
      longitude: 107.60,
      geom_type: 'Point',
      source: 'Test',
      recorded_at: '2024-01-01',
      is_dummy: true
    }
  ];

  assert.throws(() => computeNNA(dummy), /minimal 4 titik/);
});

test('computeNNA calculates R and identifies clustered vs regular configurations', () => {
  // Highly clustered points: tight group of 4 points in one corner, wide study area
  const clusteredPoints: EnvironmentalObject[] = [
    { id: '1', name: 'A', category: 'TPS', address: '', regency: '', district: '', village: '', latitude: -6.9100, longitude: 107.6000, geom_type: 'Point', source: 'Test', recorded_at: '2024-01-01', is_dummy: true },
    { id: '2', name: 'B', category: 'TPS', address: '', regency: '', district: '', village: '', latitude: -6.9101, longitude: 107.6001, geom_type: 'Point', source: 'Test', recorded_at: '2024-01-01', is_dummy: true },
    { id: '3', name: 'C', category: 'TPS', address: '', regency: '', district: '', village: '', latitude: -6.9102, longitude: 107.6000, geom_type: 'Point', source: 'Test', recorded_at: '2024-01-01', is_dummy: true },
    { id: '4', name: 'D', category: 'TPS', address: '', regency: '', district: '', village: '', latitude: -6.9101, longitude: 107.6002, geom_type: 'Point', source: 'Test', recorded_at: '2024-01-01', is_dummy: true },
  ];

  // Wide custom study area (1,000,000 m2)
  const resultClustered = computeNNA(clusteredPoints, 10000000, 'Test Cluster');
  assert.ok(resultClustered.nnaIndexR < 0.85, `Expected clustered R < 0.85, got ${resultClustered.nnaIndexR}`);
  assert.equal(resultClustered.patternResult, 'Mengelompok (Clustered)');
  assert.equal(resultClustered.nearestPairs.length, 4);
});
