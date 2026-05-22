/**
 * Master/Reference Entities
 * Location master data, exams, streams, and subjects
 */

import { ExamLevel } from './enums';

/**
 * City - Location master data for institutes and users
 */
export interface City {
  identifier: string;
  name: string;
  state: string;
  stateCode: string;
  pincodePrefix: string;
  isMetro: boolean;
  latitude: number | string;
  longitude: number | string;
}

/**
 * ExamType - Target competitive exams (JEE, NEET, MHT-CET, etc.)
 */
export interface ExamType {
  identifier: string;
  name: string;
  slug: string;
  streamIdentifier: string;
  standard: string;
  conductingBody: string;
  examLevel: ExamLevel;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

/**
 * Stream - Core academic streams - category root (Science, Commerce, Arts)
 */
export interface Stream {
  identifier: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
  displayOrder: number;
}

/**
 * Subject - Individual subjects (Physics, Chemistry, Maths, Biology, etc.)
 */
export interface Subject {
  identifier: string;
  name: string;
  slug: string;
  streamIdentifier: string;
  isActive: boolean;
}
