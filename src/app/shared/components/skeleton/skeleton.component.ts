import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TSkeletonVariant } from '@shared/types/skeleton/skeleton.types';
import { SkeletonModule } from 'primeng/skeleton';

/** Users who asked the OS for less motion get still placeholders. */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * App-wide loading placeholder (PrimeNG Skeleton underneath), so every page shimmers the
 * same way. Use it wherever content is loading: table rows, cards, tiles, avatars.
 *
 * <app-skeleton />                                  a text line
 * <app-skeleton variant="block" height="6rem" />    a thumbnail / tile
 * <app-skeleton variant="circle" width="2rem" />    an avatar
 * <app-skeleton variant="card" />                   a card in a grid
 */
@Component({
  selector: 'app-skeleton',
  imports: [SkeletonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly variant = input<TSkeletonVariant>('line');
  /** Any CSS length; lines default to the full width. */
  readonly width = input<string>('100%');
  /** Any CSS length; each variant has a sensible default. */
  readonly height = input<string | null>(null);
  readonly radius = input<string | null>(null);

  protected readonly animation = prefersReducedMotion ? 'none' : 'wave';
}
