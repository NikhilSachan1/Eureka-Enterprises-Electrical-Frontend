import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ICONS } from '@shared/constants';
import {
  ILinkedUserVehicleDetailDto,
  ILinkedVehiclePetroCardDto,
} from '../../types/fuel-expense.dto';

@Component({
  selector: 'app-linked-vehicle-petro-card',
  standalone: true,
  templateUrl: './linked-vehicle-petro-card.component.html',
  styleUrl: './linked-vehicle-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedVehiclePetroCardComponent {
  ALL_ICONS = ICONS;

  vehicle = input.required<ILinkedUserVehicleDetailDto>();
  petroCard = input<ILinkedVehiclePetroCardDto | null>(null);
}
