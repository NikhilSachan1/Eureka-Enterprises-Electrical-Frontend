import { LoadChildrenCallback } from '@angular/router';

/** What a route's `loadChildren` may return; kept intact when the guard wraps it. */
export type TLoadChildrenResult = ReturnType<LoadChildrenCallback>;
