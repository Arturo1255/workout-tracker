import { Temporal } from '@js-temporal/polyfill';
if (!('Temporal' in globalThis)) {
  (globalThis as any).Temporal = Temporal;
}

import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});

let isConnected = false;

export async function ensureDbConnected() {
  if (isConnected) return;
  
  try {
    await db.connect({ url: process.env['DATABASE_URL']! });
    isConnected = true;
  } catch (error: any) {
    if (error?.code === 'DRIVER.ALREADY_CONNECTED') {
      isConnected = true;
    } else {
      throw error;
    }
  }
}