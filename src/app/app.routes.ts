import { Routes } from '@angular/router';
import { SimulationComponent } from './pages/simulation/simulation.component';

export const routes: Routes = [

    { path: 'sim', component: SimulationComponent },
    { path: '', redirectTo: 'sim', pathMatch: 'full' }

];
