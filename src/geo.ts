export type meters = number
export type degrees = number

export type GeoPoint = {
  lon: degrees
  lat: degrees
  alt?: meters | undefined
}

export const deg = rad => rad * 180 / Math.PI
export const rad = deg => deg * Math.PI / 180

const R = 6371e3 // metres, earth’s radius (mean radius = 6,371km)

export function global_distance(
  lon1: degrees, lat1: degrees,
  lon2: degrees, lat2: degrees
): meters {
  /**
   * φ is latitude, λ is longitude
   */
  const φ1 = lat1 * Math.PI / 180 // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c
  return d
}

export function find_closest(target: GeoPoint, points: GeoPoint[], max_dist = Infinity) {
  if (!points.length) return null
  let min_point = points[0]
  let min_dist = global_distance(
    target.lon,
    target.lat,
    min_point.lon,
    min_point.lat)
  for (const point of points) {
    const dist = global_distance(
      target.lon,
      target.lat,
      point.lon,
      point.lat)
    if (dist < min_dist) {
      min_dist = dist
      min_point = point
    }
  }
  return min_dist < max_dist ? min_point : null
}

export function destination_raw(
  lon: degrees, lat: degrees, Δlon: meters, Δlat: meters
): GeoPoint {
  const dLat = Δlat * 180 / (Math.PI * R)
  const dLon = Δlon * 180 / (Math.PI * R * Math.cos(deg(lat)))
  return {
    lon: lon + dLon,
    lat: lat + dLat,
  }
}

export function destination_point(
  point: GeoPoint, Δlon: meters, Δlat: meters
) {
  return destination_raw(point.lon, point.lat, Δlon, Δlat)
}

export function destination(
  point: GeoPoint, Δlon: meters, Δlat: meters);
export function destination(
  lon: degrees, lat: degrees, Δlon: meters, Δlat: meters);
export function destination(...args: any) {
  if (typeof args[0] === 'number')
    return destination_raw(args[0], args[1], args[2], args[3])
  else
    return destination_point(args[0], args[1], args[2])
}

import { EventEmitter } from 'events'
import type { Core } from './core'

export interface GeoEntity extends GeoPoint { }
export class GeoEntity extends EventEmitter {
  uuid: string
}

export class GeoEntityManager<T extends GeoEntity = any> extends EventEmitter {
  core: Core
  all: T[] = []
  constructor(core) {
    super()
    this.core = core
  }
  closest(geopoint) {
    return find_closest(geopoint, this.all)
  }
}