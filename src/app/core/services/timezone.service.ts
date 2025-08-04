import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService {
  public readonly timezone: string;
  constructor() {
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  getTimezone(): string {
    return this.timezone;
  }
}
